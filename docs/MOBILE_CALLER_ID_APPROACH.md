# StartHere — Mobile Caller ID & Real-Time Call Screening Approach

> **Document Status**: Architectural Specification & Implementation Guide  
> **Target Platforms**: Android (CallScreeningService) & iOS (CallKit CXCallDirectoryProvider)  
> **Client Framework**: Flutter / Native Platform Channels  
> **Reference Document**: `/docs/SPECIFICATION.md`  

---

## 1. Executive Summary & Objective

In **StartHere**, protecting older adults from aggressive telephone fraud (such as grandparent emergency impostors, fake IRS/Medicare agents, and utility shutoff extortion) requires identifying incoming calls before the senior answers. 

However, incoming call handling on mobile devices operates under strict operating system sandboxes and tight latency limits:
1. **Telecom Ring Limits**: Incoming calls allow only 2–4 seconds of ring time before voicemail or answer. A synchronous network request to a remote LLM is too slow and susceptible to network latency or cold starts.
2. **Platform Sandboxing & Store Policies**: iOS strictly blocks real-time runtime network calls during incoming rings. Android restricts background call log and phone state permissions (`READ_PHONE_STATE`, `READ_CALL_LOG`) unless using official screening APIs.
3. **Senior Accessibility Constraints**: The solution must never confuse the senior with disruptive dialer changes or intimidating technical prompts.

The recommended approach uses a **Two-Tier Architecture**:
* **Tier 1 (Instant Local Verification)**: Cache the senior's `trustedContacts` from Firestore locally on-device. Incoming calls are checked synchronously against this verified offline directory in $<5\text{ms}$.
* **Tier 2 (Platform-Native Screening & Calm UX Warnings)**:
  * On **Android**: Use `CallScreeningService` to intercept the incoming number, verify against the local Family Circle, and display a high-contrast, reassuring heads-up warning if the caller is unrecognized.
  * On **iOS**: Use a CallKit `CXCallDirectoryProvider` extension to pre-register trusted family numbers so the iOS lock screen displays the family relation directly.

---

## 2. End-to-End Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SENIOR MOBILE DEVICE                            │
│                                                                        │
│  ┌──────────────────────────┐         ┌─────────────────────────────┐  │
│  │   Firestore Sync Engine  │         │   Local Fast Cache (Disk)   │  │
│  │   Listens to:            │ ──────> │   - trustedContacts         │  │
│  │   users/{uid}/contacts   │         │   - Verified family phones  │  │
│  └──────────────────────────┘         └──────────────┬──────────────┘  │
│                                                      │                 │
│                                           Fast local query (<5ms)      │
│                                                      │                 │
│  ┌───────────────────────────────────────────────────▼──────────────┐  │
│  │                     INCOMING CALL DETECTED                       │  │
│  │                                                                  │  │
│  │  [Android]: CallScreeningService.onScreenCall(details)           │  │
│  │  [iOS]:     CXCallDirectoryProvider (Pre-indexed directory)      │  │
│  └──────────────────────────┬───────────────────────────────────────┘  │
│                             │                                          │
│              ┌──────────────┴──────────────┐                           │
│              ▼                             ▼                           │
│     [In Family Circle]             [Unknown Caller]                    │
│              │                             │                           │
│              ▼                             ▼                           │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │  VERIFIED FAMILY CALL  │  │        UNVERIFIED CALL WARNING       │  │
│  │  • Green badge         │  │  • Full-screen calm alert overlay    │  │
│  │  • Display name &      │  │  • "Not in Family Circle. Take your  │  │
│  │    relationship (e.g.  │  │     time. Never give passwords, cards│  │
│  │    'Sarah - Daughter') │  │     or personal numbers."            │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Platform Implementations

### 3.1 Android: `CallScreeningService` (Android 10+ / API 29+)

`CallScreeningService` is Google's recommended standard for call identification and spam screening. It grants access to incoming numbers without requiring the app to replace the default phone dialer.

#### 1. Android Manifest Registration
Add the service inside `android/app/src/main/AndroidManifest.xml`:

```xml
<service
    android:name=".telephony.StartHereCallScreeningService"
    android:permission="android.permission.BIND_SCREENING_SERVICE"
    android:exported="true">
    <intent-filter>
        <action android:name="android.telecom.CallScreeningService" />
    </intent-filter>
</service>
```

#### 2. Native Service Implementation (`StartHereCallScreeningService.kt`)
```kotlin
package app.starthere.telephony

import android.net.Uri
import android.telecom.Call
import android.telecom.CallScreeningService
import app.starthere.data.LocalContactsRepository

class StartHereCallScreeningService : CallScreeningService() {

    override fun onScreenCall(callDetails: Call.Details) {
        // Only screen incoming calls
        if (callDetails.callDirection != Call.Details.DIRECTION_INCOMING) return

        val handle: Uri? = callDetails.handle
        val rawNumber = handle?.schemeSpecificPart ?: ""
        val normalizedNumber = normalizePhoneNumber(rawNumber)

        // Check local cached trusted contacts
        val trustedContact = LocalContactsRepository.findByPhone(applicationContext, normalizedNumber)

        val responseBuilder = CallResponse.Builder()

        if (trustedContact != null) {
            // Identified as trusted family member
            responseBuilder.setDisallowCall(false)
            responseBuilder.setSkipCallLog(false)
            responseBuilder.setSilenceCall(false)

            // Broadcast verified family status to UI overlay
            CallerOverlayManager.showVerifiedCall(
                applicationContext,
                name = trustedContact.name,
                relationship = trustedContact.relationship
            )
        } else {
            // Unknown or untrusted number
            responseBuilder.setDisallowCall(false) // Let senior decide, but inform clearly

            // Display calm, high-contrast senior protection warning
            CallerOverlayManager.showSafetyWarning(
                applicationContext,
                phoneNumber = rawNumber
            )
        }

        respondToCall(callDetails, responseBuilder.build())
    }

    private fun normalizePhoneNumber(phone: String): String {
        return phone.replace(Regex("[^0-9+]"), "")
    }
}
```

#### 3. Permission Request in Flutter / Android
The senior grants screening authorization once during onboarding using the Android `RoleManager`:

```kotlin
// In MainActivity.kt or via MethodChannel
val roleManager = getSystemService(Context.ROLE_SERVICE) as RoleManager
if (roleManager.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
    if (!roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
        val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
        startActivityForResult(intent, REQUEST_CODE_CALL_SCREENING)
    }
}
```

---

### 3.2 iOS: CallKit `CXCallDirectoryProvider`

On iOS, Apple prohibits third-party code from intercepting calls dynamically during a ring. Apps must provide a pre-compiled, sorted directory of numbers and labels via CallKit.

#### 1. Create a Call Directory Extension
Create an extension target in Xcode (`StartHereCallDirectoryExtension`) subclassing `CXCallDirectoryProvider`.

#### 2. Synchronize Firestore Contacts to Shared App Group
When the senior logs in or contacts update in Firestore, write the normalized phone numbers to an App Group container shared with the extension:

```swift
// Shared App Group sync in main iOS runner
func syncContactsToAppGroup(contacts: [[String: String]]) {
    guard let sharedDefaults = UserDefaults(suiteName: "group.app.starthere") else { return }
    sharedDefaults.set(contacts, forKey: "cached_family_contacts")
    
    // Request CallKit to reload extension data
    CXCallDirectoryManager.sharedInstance.reloadExtension(
        withIdentifier: "app.starthere.CallDirectoryExtension"
    ) { error in
        if let error = error {
            print("CallKit reload failed: \(error.localizedDescription)")
        }
    }
}
```

#### 3. Extension Implementation (`CallDirectoryHandler.swift`)
```swift
import Foundation
import CallKit

class CallDirectoryHandler: CXCallDirectoryProvider {

    override func beginRequest(with context: CXCallDirectoryExtensionContext) {
        context.delegate = self

        guard let sharedDefaults = UserDefaults(suiteName: "group.app.starthere"),
              let contacts = sharedDefaults.array(forKey: "cached_family_contacts") as? [[String: String]] else {
            context.completeRequest()
            return
        }

        // Numbers MUST be sorted numerically in ascending order for CallKit
        let sortedEntries = contacts.compactMap { dict -> (CXCallDirectoryPhoneNumber, String)? in
            guard let phoneStr = dict["phone"]?.filter("0123456789".contains),
                  let number = Int64(phoneStr),
                  let name = dict["name"],
                  let relation = dict["relationship"] else { return nil }
            return (number, "Family: \(name) (\(relation))")
        }.sorted(by: { $0.0 < $1.0 })

        // Clear previous entries and re-insert
        context.removeAllIdentificationEntries()
        for entry in sortedEntries {
            context.addIdentificationEntry(withNextSequentialPhoneNumber: entry.0, label: entry.1)
        }

        context.completeRequest()
    }
}
```

---

## 4. Integration with StartHere Specification Data Models

### 4.1 Syncing `trustedContacts`
From `SPECIFICATION.md` Section 4:
```typescript
interface TrustedContact {
  id: string;
  seniorUid: string;
  name: string;
  relationship: string;      // e.g. "Daughter", "Son", "Neighbor"
  phone: string;
  status: 'invited' | 'active';
  // ...
}
```

**Sync Rule:**
* Listen to `users/{seniorUid}/trustedContacts` where `status == "active"`.
* Keep an offline snapshot stored in local SQLite / `SharedPreferences` on the device.
* Whenever a new family member accepts an invite (`acceptInvite`), the client snapshot refreshes automatically, updating the native Call Directory.

---

## 5. Senior-Centered UI/UX Warning Design

Adhering strictly to **Section 8 (Senior-Centered UI & Accessibility Guidelines)**:
* **Font Size**: 22–24px body font with high contrast text.
* **Touch Targets**: Minimum $48 \times 48\text{px}$.
* **Tone**: Non-alarmist, clear, and action-oriented. Never display technical error codes.

### Incoming Unknown Caller Overlay Copy:
> **"Unverified Caller"**  
> **"This caller is not in your Family Safety Circle."**  
> *"Take your time. Remember: banks, government offices, and companies will never ask you for passwords, card numbers, or gift cards over the phone."*  
> 
> `[ Button: How to Spot Phone Scams ]`  
> `[ Button: Ask Tech Coach ]`

---

## 6. Post-Call Scam Check Workflow

If an unknown caller pressures the senior or mentions urgent demands (e.g., money transfer, missed jury duty, Medicare replacement):
1. **Senior Opens StartHere**:
   - The Home screen displays an accessible card: *"Did someone just call you about money, accounts, or prizes?"*
2. **Instant Scam Check (`scamCheck`)**:
   - The senior speaks or types what the caller claimed using the dedicated `MicButton` (STT).
   - Gemini evaluates the claim against the benchmark rules (Section 7), categorizes the risk (`likely_scam`), and suggests immediate action (*"Hang up and do not call back"*).
3. **Family Safety Alert (`sendAlert`)**:
   - If evaluated as `likely_scam`, an automatic alert is dispatched to the Family Circle (`alerts/{alertId}`) so family members can follow up with one tap (*"Call Mom"*).

---

## 7. Summary & Recommendations

| Item | Android | iOS |
|---|---|---|
| **API** | `android.telecom.CallScreeningService` | CallKit `CXCallDirectoryProvider` |
| **Lookup Mode** | Live on-ring local query | Pre-indexed offline directory |
| **Unknown Call UX** | Real-time safety overlay banner | Native lock screen label (Known Family) |
| **Permissions** | `ROLE_CALL_SCREENING` | User Settings > Phone > Call Blocking & Identification |
| **Offline Support** | 100% offline via local cache | 100% offline via CallKit database |
| **Data Source** | `users/{uid}/trustedContacts` | `users/{uid}/trustedContacts` |
