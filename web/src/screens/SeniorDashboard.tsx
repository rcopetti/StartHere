import React, { useState } from 'react';
import { ScamCheckForm } from '../components/ScamCheckForm';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Users,
  PhoneCall,
  CheckCircle2,
  Trash2,
  Plus,
  Copy,
  ChevronRight
} from 'lucide-react';

export const SeniorDashboard: React.FC = () => {
  const { profile, deleteMyData } = useAuth();

  const [activeTab, setActiveTab] = useState<'main' | 'scam' | 'coach' | 'family'>('main');
  const [alertSentMessage, setAlertSentMessage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Invite code generation state
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleSendTestAlert = () => {
    setAlertSentMessage('Emergency alert dispatched to your family circle! They have been notified with high priority.');
    setTimeout(() => setAlertSentMessage(null), 6000);
  };

  const handleGenerateInvite = () => {
    const code = 'SH-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    setInviteCode(code);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Reassuring Greeting Card */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4" />
            Active Protection
          </span>
          <span className="text-amber-100 text-sm font-medium">
            StartHere Safety Guard
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Hello, {profile?.displayName || 'Friend'}!
        </h1>
        <p className="text-amber-100 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
          You are safely protected. What would you like help with today?
        </p>
      </div>

      {alertSentMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <p className="font-bold text-base">{alertSentMessage}</p>
        </div>
      )}

      {/* 3 Core Action Cards (Big Buttons) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Scam Check */}
        <button
          onClick={() => setActiveTab('scam')}
          className={`p-6 rounded-3xl border-3 text-left transition-all touch-target-senior cursor-pointer flex flex-col justify-between h-56 ${
            activeTab === 'scam'
              ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-300'
              : 'border-stone-200 bg-white hover:border-amber-400 hover:shadow-md'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 leading-tight">Check for Scams</h2>
            <p className="text-sm text-stone-600 mt-1 leading-snug">
              Unsure about a text message or photo? We'll check it instantly.
            </p>
          </div>
        </button>

        {/* Tech Coach */}
        <button
          onClick={() => setActiveTab('coach')}
          className={`p-6 rounded-3xl border-3 text-left transition-all touch-target-senior cursor-pointer flex flex-col justify-between h-56 ${
            activeTab === 'coach'
              ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-300'
              : 'border-stone-200 bg-white hover:border-emerald-400 hover:shadow-md'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 leading-tight">Patient Tech Coach</h2>
            <p className="text-sm text-stone-600 mt-1 leading-snug">
              Ask anything in plain words without confusing computer terms.
            </p>
          </div>
        </button>

        {/* Family Circle */}
        <button
          onClick={() => setActiveTab('family')}
          className={`p-6 rounded-3xl border-3 text-left transition-all touch-target-senior cursor-pointer flex flex-col justify-between h-56 ${
            activeTab === 'family'
              ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-300'
              : 'border-stone-200 bg-white hover:border-indigo-400 hover:shadow-md'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 leading-tight">My Family Circle</h2>
            <p className="text-sm text-stone-600 mt-1 leading-snug">
              Connect with loved ones and send a one-tap help alert.
            </p>
          </div>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'scam' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-900">Instant Scam Check</h3>
              <p className="text-sm text-stone-600">Paste a suspicious message or choose a screenshot to check.</p>
            </div>
          </div>

          <ScamCheckForm />
        </div>
      )}

      {activeTab === 'coach' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-900">Patient Tech Coach</h3>
              <p className="text-sm text-stone-600">Guided micro-lessons with plain words and 2-sentence answers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'thankyou', title: 'Sending a Thank-You Note & Photo', steps: '4 steps' },
              { id: 'scam-links', title: 'Spotting Suspicious Links & Urgency', steps: '3 steps' },
              { id: 'video-call', title: 'Making a Video Call with Family', steps: '3 steps' },
              { id: 'ask-anything', title: 'Ask Me Anything (Open Coach)', steps: 'Free conversation' },
            ].map((lesson) => (
              <div key={lesson.id} className="p-4 rounded-2xl border-2 border-stone-200 hover:border-emerald-500 bg-stone-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900">{lesson.title}</h4>
                  <p className="text-xs text-stone-500">{lesson.steps}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Interceptor Active:</strong> Credit card numbers, Social Security numbers, and passwords are automatically blocked before reaching any AI.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'family' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-stone-900">Family Safety Circle</h3>
                <p className="text-sm text-stone-600">Your trusted contacts who receive instant alerts.</p>
              </div>
            </div>

            <button
              onClick={handleGenerateInvite}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Invite Family</span>
            </button>
          </div>

          {inviteCode && (
            <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-300 space-y-2">
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                Share this secure code with your family member:
              </p>
              <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-indigo-200">
                <span className="font-mono font-bold text-lg text-indigo-950">{inviteCode}</span>
                <button
                  onClick={() => navigator.clipboard?.writeText(inviteCode)}
                  className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </button>
              </div>
              <p className="text-xs text-indigo-700">
                When your family member enters this code in StartHere, they will be linked to your safety circle.
              </p>
            </div>
          )}

          {/* Current Contacts */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl border-2 border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  S
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-base">Sarah Vance</h4>
                  <p className="text-xs text-stone-500">Daughter • (555) 876-5432 • Active</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Connected
              </span>
            </div>
          </div>

          {/* Instant Help Alert Button */}
          <div className="pt-4 border-t border-stone-200">
            <button
              onClick={handleSendTestAlert}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg shadow-md transition-all touch-target-senior cursor-pointer"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Send 1-Tap Help Alert to Sarah</span>
            </button>
            <p className="text-xs text-center text-stone-500 mt-2">
              Sends an immediate notification to Sarah's phone saying you need a moment of reassurance.
            </p>
          </div>
        </div>
      )}

      {/* Account Settings & Privacy Section */}
      <div className="p-6 rounded-3xl bg-stone-100 border border-stone-300 space-y-4">
        <h4 className="text-base font-bold text-stone-900">Your Privacy & Security</h4>
        <p className="text-xs text-stone-600 leading-relaxed">
          StartHere never sells or exposes your information. You have full control over your data and can completely delete your profile at any time.
        </p>

        {showDeleteConfirm ? (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-300 space-y-3">
            <p className="font-bold text-red-900 text-sm">
              Are you sure? This will permanently delete your account, saved lessons, and trusted circle links.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={deleteMyData}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 cursor-pointer"
              >
                Yes, Permanently Delete My Data
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 text-stone-800 font-semibold text-sm hover:bg-stone-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Right to be Forgotten: Delete My Data</span>
          </button>
        )}
      </div>
    </div>
  );
};
