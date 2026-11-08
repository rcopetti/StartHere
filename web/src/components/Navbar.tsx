import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Heart, LogOut, Type, Sun } from 'lucide-react';
import { FontSizePreference } from '../types';

export const Navbar: React.FC = () => {
  const { profile, signOutUser, updatePreferences } = useAuth();

  const currentFontSize = profile?.fontSizePreference || 'standard';
  const isHighContrast = profile?.highContrast || false;

  const cycleFontSize = async () => {
    const nextSize: Record<FontSizePreference, FontSizePreference> = {
      standard: 'large',
      large: 'extra_large',
      extra_large: 'standard'
    };
    await updatePreferences({ fontSizePreference: nextSize[currentFontSize] });
  };

  const toggleHighContrast = async () => {
    await updatePreferences({ highContrast: !isHighContrast });
  };

  return (
    <header className={`border-b sticky top-0 z-30 transition-colors ${
      isHighContrast
        ? 'bg-black text-white border-zinc-700'
        : 'bg-white text-stone-900 border-stone-200 shadow-xs'
    }`}>
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
        {/* Brand & Accessibility Label */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-2xl shadow-sm">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-xl sm:text-2xl">StartHere</span>
              {profile?.role === 'senior' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Senior Mode
                </span>
              )}
              {profile?.role === 'family' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300">
                  <Heart className="w-3.5 h-3.5" />
                  Family Circle
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 hidden sm:block">Simple tech help & trusted scam protection</p>
          </div>
        </div>

        {/* Accessibility & User Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Text Size Control */}
          <button
            onClick={cycleFontSize}
            title="Adjust text size (Standard, Large, Extra Large)"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-bold touch-target-senior transition-all ${
              isHighContrast
                ? 'bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700'
                : 'bg-stone-100 border-stone-300 text-stone-800 hover:bg-stone-200'
            }`}
          >
            <Type className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider font-semibold">
              {currentFontSize === 'standard' && 'Text: A'}
              {currentFontSize === 'large' && 'Text: A+'}
              {currentFontSize === 'extra_large' && 'Text: A++'}
            </span>
          </button>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            title="Toggle high contrast mode"
            className={`flex items-center justify-center w-11 h-11 rounded-xl border touch-target-senior transition-all ${
              isHighContrast
                ? 'bg-amber-400 border-amber-300 text-black font-bold'
                : 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
            }`}
            aria-label="Toggle High Contrast"
          >
            <Sun className="w-5 h-5" />
          </button>

          {/* User Profile / Sign Out */}
          {profile && (
            <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-zinc-700">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold leading-tight">{profile.displayName}</p>
                <p className="text-xs text-stone-500">{profile.role === 'senior' ? 'Protected' : 'Family Member'}</p>
              </div>

              <button
                onClick={signOutUser}
                title="Sign out of your account"
                className={`p-2.5 rounded-xl border flex items-center justify-center touch-target-senior transition-all ${
                  isHighContrast
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                    : 'bg-stone-100 border-stone-300 text-stone-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                }`}
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
