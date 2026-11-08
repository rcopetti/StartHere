import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  CheckCircle,
  Clock,
  Plus,
  Check,
  ArrowRight
} from 'lucide-react';

interface MockAlert {
  id: string;
  type: 'scam_detected' | 'manual_help_request';
  seniorName: string;
  headline: string;
  summary: string;
  timestamp: string;
  acknowledged: boolean;
  ackBy?: string;
}

export const FamilyDashboard: React.FC = () => {
  const { profile } = useAuth();

  const [inviteTokenInput, setInviteTokenInput] = useState<string>('');
  const [linkingSenior, setLinkingSenior] = useState<boolean>(false);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<MockAlert[]>([
    {
      id: 'alert-1',
      type: 'scam_detected',
      seniorName: 'Eleanor Vance',
      headline: 'Urgent Fake Delivery Notice Blocked',
      summary: 'A suspicious text message requesting $1.95 for package delivery was analyzed and flagged as Likely Scam. Eleanor did not click the link.',
      timestamp: '15 minutes ago',
      acknowledged: false,
    },
    {
      id: 'alert-2',
      type: 'manual_help_request',
      seniorName: 'Eleanor Vance',
      headline: 'Eleanor requested a quick check-in',
      summary: 'Tapped "Need Help / Call Family" from the StartHere home screen.',
      timestamp: 'Yesterday at 4:20 PM',
      acknowledged: true,
      ackBy: 'Sarah Vance',
    }
  ]);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          acknowledged: true,
          ackBy: profile?.displayName || 'You'
        };
      }
      return a;
    }));
  };

  const handleLinkInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteTokenInput.trim()) return;

    setLinkingSenior(true);
    setTimeout(() => {
      setLinkingSenior(false);
      setLinkSuccess('Successfully linked to Eleanor Vance! You are now an active safety contact.');
      setInviteTokenInput('');
    }, 900);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Family Circle Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <Heart className="w-4 h-4 text-pink-300" />
            Family Circle Companion
          </span>
          <span className="text-indigo-200 text-sm font-medium">
            Active Caregiver Mode
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Welcome, {profile?.displayName || 'Family Member'}!
        </h1>
        <p className="text-indigo-100 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
          Monitor your loved ones' safety in real time, acknowledge alerts with one tap, and provide instant reassurance.
        </p>
      </div>

      {/* Linked Seniors Summary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">Protected Family Members</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            1 Senior Connected
          </span>
        </div>

        <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-2xl">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-stone-900">Eleanor Vance</h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Protected
                </span>
              </div>
              <p className="text-sm text-stone-500 mt-0.5">
                Phone: (555) 234-5678 • Auto-Alert on Scam: Enabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="tel:5552345678"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition-all touch-target-senior"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Eleanor</span>
            </a>
          </div>
        </div>
      </div>

      {/* Real-time Alerts Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Safety & Scam Alert Feed</h2>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl border-2 transition-all ${
                alert.acknowledged
                  ? 'bg-stone-50 border-stone-200'
                  : 'bg-amber-50/70 border-amber-300 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    alert.type === 'scam_detected' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {alert.type === 'scam_detected' ? (
                      <ShieldAlert className="w-6 h-6" />
                    ) : (
                      <PhoneCall className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-lg text-stone-900">{alert.headline}</span>
                      <span className="text-xs text-stone-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                    </div>

                    <p className="text-stone-700 text-sm leading-relaxed max-w-2xl">
                      {alert.summary}
                    </p>

                    {alert.acknowledged && (
                      <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 pt-2">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Handled: {alert.ackBy} tapped "I've got it"
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {!alert.acknowledged && (
                  <div className="shrink-0 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>I've Got It</span>
                    </button>
                    <a
                      href="tel:5552345678"
                      className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-bold text-sm transition-all flex items-center gap-1.5"
                    >
                      <PhoneCall className="w-4 h-4 text-stone-600" />
                      <span>Call</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Link New Senior Via Invite Code Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900">Connect to Another Family Member</h3>
            <p className="text-xs text-stone-500">
              Enter the 32-character invite code generated on your loved one's device.
            </p>
          </div>
        </div>

        {linkSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{linkSuccess}</span>
          </div>
        )}

        <form onSubmit={handleLinkInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={inviteTokenInput}
            onChange={(e) => setInviteTokenInput(e.target.value)}
            placeholder="Paste code (e.g. SH-7G4B9X-2M9K...)"
            className="flex-1 px-4 py-3 rounded-xl border-2 border-stone-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-mono text-sm uppercase"
          />
          <button
            type="submit"
            disabled={linkingSenior || !inviteTokenInput.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{linkingSenior ? 'Validating...' : 'Link Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
