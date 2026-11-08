import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, House, ShieldCheck, type LucideIcon } from 'lucide-react';
import { ROUTES, activeTabForPath, type AppTab } from '../navigation/routes';

interface TabDefinition {
  id: AppTab;
  label: string;
  icon: LucideIcon;
  path: string;
}

const TABS: TabDefinition[] = [
  { id: 'home', label: 'Home', icon: House, path: ROUTES.home },
  { id: 'check', label: 'Check', icon: ShieldCheck, path: ROUTES.check },
  { id: 'coach', label: 'Coach', icon: GraduationCap, path: ROUTES.coach },
];

export const BottomTabs: React.FC = () => {
  const { pathname } = useLocation();
  const activeTab = activeTabForPath(pathname);

  return (
    <nav className="bottom-tabs" aria-label="Main navigation">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            to={tab.path}
            className="bottom-tab"
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-tab__marker" />
            <span className="bottom-tab__icon">
              <Icon
                size={26}
                strokeWidth={isActive ? 2.6 : 2.2}
                color={isActive ? '#183E2A' : '#435159'}
                aria-hidden="true"
                focusable="false"
              />
            </span>
            <span className="bottom-tab__label">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
