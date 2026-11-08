/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { SignInScreen } from './screens/SignInScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { SeniorDashboard } from './screens/SeniorDashboard';
import { FamilyDashboard } from './screens/FamilyDashboard';

const MainContent: React.FC = () => {
  const { user, profile, loading, profileError } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-stone-50 text-stone-800">
        <div className="w-16 h-16 rounded-3xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-3xl shadow-lg animate-bounce mb-4">
          S
        </div>
        <h2 className="text-2xl font-bold text-stone-900">Loading StartHere...</h2>
        <p className="text-stone-500 text-sm mt-1">Preparing your warm and secure tech environment</p>
      </div>
    );
  }

  // Not signed in
  if (!user && !profile) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <SignInScreen />
        </main>
      </div>
    );
  }

  // Signed in but onboarding incomplete
  if (profileError || !profile?.onboarded) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          {profileError ? <p role="alert" className="p-6">{profileError}</p> : <OnboardingScreen />}
        </main>
      </div>
    );
  }

  // Authenticated & Onboarded: Render active role dashboard
  return (
    <div className={`min-h-screen flex flex-col ${profile.highContrast ? 'bg-black text-white' : 'bg-stone-50 text-stone-900'}`}>
      <Navbar />
      <main className="flex-1 pb-16">
        {profile.role === 'senior' ? <SeniorDashboard /> : <FamilyDashboard />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <AppWrapper />
      </div>
    </AuthProvider>
  );
}

// Inner wrapper to apply user font preference classes dynamically
function AppWrapper() {
  const { profile } = useAuth();
  const fontClass = `font-pref-${profile?.fontSizePreference || 'standard'}`;
  const contrastClass = profile?.highContrast ? 'high-contrast' : '';

  return (
    <div className={`${fontClass} ${contrastClass}`}>
      <MainContent />
    </div>
  );
}
