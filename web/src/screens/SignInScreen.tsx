import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Sparkles, HeartHandshake, Lock, ArrowRight } from 'lucide-react';

export const SignInScreen: React.FC = () => {
  const { signInWithGoogle, signInAsDemoUser, loading, error, clearError } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Banner & Reassurance */}
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-amber-700" />
          Accessibility-First Technology Coaching & Scam Protection
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          Technology Made Simple. <br />
          <span className="text-amber-600">Scam Protection You Can Trust.</span>
        </h1>

        <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
          StartHere is built with large, easy-to-read text and a patient, jargon-free voice.
          Check suspicious messages in seconds, learn at your own pace, and stay connected with family.
        </p>
      </div>

      {/* Main Sign-In Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-stone-200 shadow-xl max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-stone-900">Sign in to StartHere</h2>
          <p className="text-stone-600 text-base">
            Safe, secure sign-in with your Google account.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-sm space-y-3">
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold leading-relaxed">{error}</span>
              <button
                onClick={clearError}
                className="text-amber-800 font-bold hover:underline shrink-0 text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1 border-t border-amber-200">
              <button
                onClick={signInWithGoogle}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
              >
                Try Sign In Again
              </button>
              <button
                onClick={() => signInAsDemoUser('senior')}
                className="px-3 py-1.5 rounded-lg bg-white border border-amber-400 hover:bg-amber-100 text-stone-900 font-bold text-xs cursor-pointer"
              >
                Explore as Eleanor (Senior)
              </button>
            </div>
          </div>
        )}

        {/* Primary Google Sign-In Button */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.99] font-bold text-lg shadow-md transition-all touch-target-senior disabled:opacity-60 cursor-pointer"
        >
          {/* Google G Logo */}
          <svg className="w-6 h-6 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
        </button>

        {/* Security & Anti-Jargon Guarantee */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-900 text-sm">
          <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-emerald-950">Zero-Risk Security Guarantee</p>
            <p className="text-emerald-800 text-xs sm:text-sm leading-relaxed">
              StartHere will <strong>never ask</strong> for passwords, bank account numbers,
              credit cards, or your Social Security number.
            </p>
          </div>
        </div>

        {/* Fast Demo Persona Switcher */}
        <div className="pt-4 border-t border-stone-200">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-bold text-center mb-3">
            Or explore immediately with demo roles:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => signInAsDemoUser('senior')}
              className="flex items-center justify-between p-3.5 rounded-xl border-2 border-stone-300 hover:border-amber-500 bg-stone-50 hover:bg-amber-50 text-stone-900 font-semibold text-sm transition-all text-left"
            >
              <div>
                <p className="font-bold">Eleanor Vance</p>
                <p className="text-xs text-stone-500">Senior Mode (Protected)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </button>

            <button
              onClick={() => signInAsDemoUser('family')}
              className="flex items-center justify-between p-3.5 rounded-xl border-2 border-stone-300 hover:border-indigo-500 bg-stone-50 hover:bg-indigo-50 text-stone-900 font-semibold text-sm transition-all text-left"
            >
              <div>
                <p className="font-bold">Sarah Vance</p>
                <p className="text-xs text-stone-500">Family Circle (Daughter)</p>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Pillar Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Instant Scam Check</h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            Got an unusual text message or picture? Paste it or upload it to get a plain-English verdict in seconds.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Patient Tech Coach</h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            Ask any question without feeling rushed. Answers are kept to 1–2 friendly sentences with no confusing jargon.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">Family Safety Circle</h3>
          <p className="text-stone-600 text-sm leading-relaxed">
            Automatically alerts trusted family members if a scam is detected, with one-tap reassurance and help calls.
          </p>
        </div>
      </div>
    </div>
  );
};
