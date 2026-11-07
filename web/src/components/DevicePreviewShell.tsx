/**
 * DevicePreviewShell — Universal Phone Bezel Container
 * Displays a realistic smartphone frame on desktop screens while rendering full-bleed on mobile viewports.
 * Includes a top utility bar with quick Role Switcher and accessibility toggles.
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LessonCatalogScreen } from '../screens/LessonCatalogScreen';
import { ScenarioLessonScreen } from '../screens/ScenarioLessonScreen';
import { LessonSummaryScreen } from '../screens/LessonSummaryScreen';
import { ScamCheckScreen } from '../screens/ScamCheckScreen';
import { ScamVerdictScreen } from '../screens/ScamVerdictScreen';
import { FamilyCircleScreen } from '../screens/FamilyCircleScreen';
import { FamilyPortalScreen } from '../screens/FamilyPortalScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export const DevicePreviewShell: React.FC = () => {
  const { currentScreen, role, setRole, setScreen, highContrast, setHighContrast } = useApp();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen />;
      case 'home':
        return <HomeScreen />;
      case 'catalog':
        return <LessonCatalogScreen />;
      case 'scenario':
        return <ScenarioLessonScreen />;
      case 'lesson-complete':
        return <LessonSummaryScreen />;
      case 'scam-check':
        return <ScamCheckScreen />;
      case 'scam-verdict':
        return <ScamVerdictScreen />;
      case 'family':
        return <FamilyCircleScreen />;
      case 'family-portal':
        return <FamilyPortalScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start p-0 md:p-6 font-sans">
      {/* Top Utility Bar on Desktop */}
      <div className="w-full max-w-xl hidden md:flex items-center justify-between text-white text-xs mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wide uppercase text-blue-400">StartHere</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">Active View: {role === 'family' ? 'Family Portal' : 'Senior Phone'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const newRole = role === 'family' ? 'senior' : 'family';
              setRole(newRole);
              setScreen(newRole === 'family' ? 'family-portal' : 'home');
            }}
            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer"
          >
            {role === 'family' ? '👴 Switch to Senior View' : '👨‍👩‍👧 Switch to Family Portal'}
          </button>
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            {highContrast ? '☀️ Normal Contrast' : '🌙 High Contrast'}
          </button>
        </div>
      </div>

      {/* Simulated Mobile Device Frame */}
      <div
        className={`w-full md:max-w-[440px] h-screen md:h-[900px] flex flex-col md:rounded-[42px] overflow-hidden md:border-[10px] md:border-slate-800 md:shadow-2xl relative ${
          highContrast ? 'bg-black' : 'bg-slate-50'
        }`}
      >
        {/* Phone Dynamic Island / Speaker notch on desktop */}
        <div className="w-full bg-slate-900 hidden md:flex items-center justify-between px-8 py-2 z-30 select-none">
          <span className="text-white text-xs font-semibold">9:41</span>
          <div className="w-20 h-4 bg-black rounded-full" />
          <div className="flex items-center gap-1.5 text-white text-xs">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* Active Screen View */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {renderActiveScreen()}
        </div>

        {/* Mobile Home Indicator Bar on desktop */}
        <div className="w-full py-1.5 bg-slate-900 hidden md:flex justify-center items-center select-none">
          <div className="w-32 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
