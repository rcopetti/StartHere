import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, FontSizePreference } from '../dashboardTypes';
import { Shield, Heart, Check, Bell, ArrowRight, Sun } from 'lucide-react';

export const OnboardingScreen: React.FC = () => {
  const { user, completeOnboarding, loading } = useAuth();

  const [customize, setCustomize] = useState(false);
  const [role, setRole] = useState<UserRole>('senior');
  const [displayName, setDisplayName] = useState<string>(user?.displayName || '');
  const [phone, setPhone] = useState<string>('');
  const [fontSizePreference, setFontSizePreference] = useState<FontSizePreference>('large');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [autoAlertOnScam, setAutoAlertOnScam] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const saveRole = async (selectedRole: UserRole, useDefaults = false) => {
    if (!useDefaults && !displayName.trim()) {
      setError('Please provide your name so family knows who you are.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await completeOnboarding({
        role: selectedRole,
        displayName: useDefaults ? (user?.displayName?.trim().slice(0, 100) || 'Friend') : displayName.trim(),
        phone: useDefaults ? '' : phone.trim(),
        fontSizePreference: useDefaults ? (selectedRole === 'senior' ? 'large' : 'standard') : fontSizePreference,
        highContrast: useDefaults ? false : highContrast,
        autoAlertOnScam: useDefaults ? true : autoAlertOnScam
      });
    } catch (err: unknown) {
      console.error('Failed to complete onboarding:', err);
      const msg = err instanceof Error ? err.message : 'Could not save profile. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void saveRole(role);
  };

  if (!customize) {
    return (
      <div className="w-full max-w-xl space-y-5 rounded-3xl border-2 border-stone-200 bg-white p-6 shadow-xl sm:p-10">
        <h1 className="text-3xl font-extrabold text-stone-900">Choose how to use StartHere</h1>
        <p className="text-stone-700">Choose the dashboard you’d like to open with your Google account.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" disabled={submitting} onClick={() => void saveRole('senior', true)}
            className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 text-left font-bold disabled:opacity-60">
            Senior Mode
            <span className="mt-1 block text-sm font-normal">Scam Check, Tech Coach, and Family Circle</span>
          </button>
          <button type="button" disabled={submitting} onClick={() => void saveRole('family', true)}
            className="rounded-xl border-2 border-indigo-400 bg-indigo-50 p-4 text-left font-bold disabled:opacity-60">
            Family Circle
            <span className="mt-1 block text-sm font-normal">Family alerts and linked seniors</span>
          </button>
        </div>
        <button type="button" disabled={submitting} onClick={() => { setError(null); setCustomize(true); }}
          className="font-semibold text-stone-700 underline disabled:opacity-60">
          Customize my setup
        </button>
        {submitting && <p role="status">Opening your dashboard…</p>}
        {error && <p role="alert" className="text-red-800">{error}</p>}
      </div>
    );
  }
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 uppercase tracking-wide">
            Welcome to StartHere
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900">
            Let's Make This Comfortable for You
          </h1>
          <p className="text-stone-600 text-base">
            Tell us a little about how you plan to use StartHere.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Role Selection */}
          <div className="space-y-3">
            <label className="block text-lg font-bold text-stone-900">
              1. Who is using this device?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Senior Option */}
              <button
                type="button"
                onClick={() => {
                  setRole('senior');
                  setFontSizePreference('large');
                }}
                className={`p-5 rounded-2xl border-3 text-left transition-all touch-target-senior cursor-pointer flex flex-col justify-between ${
                  role === 'senior'
                    ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-300'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  {role === 'senior' && (
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900">I am an Older Adult</h3>
                  <p className="text-sm text-stone-600 mt-1 leading-snug">
                    Easy-to-read text, gentle tech coach, and instant scam protection.
                  </p>
                </div>
              </button>

              {/* Family Option */}
              <button
                type="button"
                onClick={() => {
                  setRole('family');
                  setFontSizePreference('standard');
                }}
                className={`p-5 rounded-2xl border-3 text-left transition-all touch-target-senior cursor-pointer flex flex-col justify-between ${
                  role === 'family'
                    ? 'border-indigo-500 bg-indigo-50/60 shadow-md ring-2 ring-indigo-300'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                    <Heart className="w-6 h-6" />
                  </div>
                  {role === 'family' && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900">Family / Caregiver</h3>
                  <p className="text-sm text-stone-600 mt-1 leading-snug">
                    Stay connected, receive alerts, and respond with reassurance.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Step 2: Name & Phone */}
          <div className="space-y-4">
            <label className="block text-lg font-bold text-stone-900">
              2. Your Name & Contact
            </label>

            <div>
              <span className="block text-sm font-semibold text-stone-700 mb-1">
                Preferred Name
              </span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Eleanor or Mom"
                required
                className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-lg text-stone-900"
              />
            </div>

            <div>
              <span className="block text-sm font-semibold text-stone-700 mb-1">
                Phone Number (Optional)
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-stone-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-lg text-stone-900"
              />
              <p className="text-xs text-stone-500 mt-1">
                Used only for emergency one-tap call links with your family circle.
              </p>
            </div>
          </div>

          {/* Step 3: Accessibility & Font Size */}
          <div className="space-y-4">
            <label className="block text-lg font-bold text-stone-900">
              3. Text Size Preference
            </label>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'standard', label: 'Standard', desc: '18px font' },
                { id: 'large', label: 'Large (Recommended)', desc: '21px font' },
                { id: 'extra_large', label: 'Extra Large', desc: '24px font' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFontSizePreference(opt.id as FontSizePreference)}
                  className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    fontSizePreference === opt.id
                      ? 'border-amber-500 bg-amber-50 font-bold text-stone-900 ring-2 ring-amber-200'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <p className="font-bold text-sm sm:text-base">{opt.label}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            {/* Live Text Preview Box */}
            <div className="p-4 rounded-xl bg-stone-100 border border-stone-200">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-bold block mb-1">
                Live Text Preview:
              </span>
              <p className={`text-stone-900 transition-all ${
                fontSizePreference === 'standard' ? 'text-lg' :
                fontSizePreference === 'large' ? 'text-xl' : 'text-2xl'
              }`}>
                "Hello {displayName || 'Friend'}! This is how easy your text will be to read."
              </p>
            </div>

            {/* High Contrast Toggle */}
            <div className="p-4 rounded-xl border-2 border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-200 text-stone-800">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-sm">High Contrast Display</p>
                  <p className="text-xs text-stone-500">Dark high-visibility colors for sensitive eyes</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Step 4: Safety Features */}
          {role === 'senior' && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-200 text-amber-900">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900 text-base">Automatic Family Scam Alerts</p>
                    <p className="text-xs text-stone-600">
                      When a message is identified as a likely scam, notify your safety circle.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={autoAlertOnScam}
                  onChange={(e) => setAutoAlertOnScam(e.target.checked)}
                  className="w-6 h-6 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-extrabold text-xl shadow-lg transition-all touch-target-senior cursor-pointer disabled:opacity-60"
          >
            <span>{submitting ? 'Saving Profile...' : 'Start Using StartHere'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
