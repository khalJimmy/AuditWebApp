import React from 'react';
import { User } from '../types';
import {
  LayoutDashboard,
  Calendar,
  FileEdit,
  Send,
  Clock,
  FolderArchive,
  CheckSquare,
  Building2,
  Users,
  Settings,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  currentUser?: User | null;
  user?: User | null;
  activeTab: string;
  onSelectTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
  onLogout: () => void;
}

const NAVMAP: Record<string, string[]> = {
  admin: ['dash', 'plan', 'audit', 'dispatch', 'tracker', 'records', 'depts', 'users', 'settings'],
  auditor: ['dash', 'plan', 'audit', 'records'],
  spoc: ['spoc'],
  hod: ['dash', 'tracker', 'records']
};

interface NavItemConfig {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}

const NAV_ITEMS: Record<string, NavItemConfig> = {
  dash: { label: 'Dashboard', icon: LayoutDashboard },
  plan: { label: 'Planner', icon: Calendar },
  audit: { label: 'Audit Form', icon: FileEdit },
  dispatch: { label: 'Dispatch', icon: Send },
  tracker: { label: 'TAT Tracker', icon: Clock },
  records: { label: 'Records', icon: FolderArchive },
  spoc: { label: 'My Actions', icon: CheckSquare },
  depts: { label: 'Departments', icon: Building2 },
  users: { label: 'Users', icon: Users },
  settings: { label: 'Settings', icon: Settings }
};

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  user: userProp,
  activeTab,
  onSelectTab,
  onTabChange,
  onLogout
}) => {
  const user = currentUser || userProp;
  const role = user?.role || 'spoc';
  const allowedTabs = NAVMAP[role] || NAVMAP['admin'];
  const handleTabSelect = onSelectTab || onTabChange || (() => {});

  const roleLabels: Record<string, string> = {
    admin: 'Admin / Lead',
    auditor: 'Auditor',
    spoc: 'SPOC'
  };

  const roleClass: Record<string, string> = {
    admin: 'ur-admin',
    auditor: 'ur-auditor',
    spoc: 'ur-spoc'
  };

  return (
    <header className="hdr">
      <div className="hdr-inner" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', height: '100%' }}>
        <div className="hdr-logo">
          <div className="cg-logo">
            <div className="cg-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 9.5L12 3L21 9.5V21H15V15H9V21H3V9.5Z" fill="rgba(255,255,255,0.95)" stroke="rgba(255,255,255,0.3)" strokeWidth=".5" />
              </svg>
            </div>
            <div>
              <div className="cg-name">CASAGRAND</div>
              <div className="cg-tagline">Process Audit · P&amp;C</div>
            </div>
          </div>
        </div>

        <div className="hdr-module">
          <span className="hdr-module-text">v4.0</span>
          <span className="hdr-module-badge">Live</span>
        </div>

        <nav className="hdr-nav">
          {allowedTabs.map(tab => {
            const item = NAV_ITEMS[tab];
            const IconComponent = item ? item.icon : null;
            return (
              <button
                type="button"
                key={tab}
                className={`nb ${activeTab === tab ? 'on' : ''}`}
                onClick={() => handleTabSelect(tab)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {IconComponent && <IconComponent size={14} style={{ opacity: 0.85 }} />}
                <span>{item ? item.label : tab}</span>
              </button>
            );
          })}
        </nav>

        <div className="hdr-right">
          <div className="uchip">
            <div className="uavatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="uname">{user?.name || 'User'}</div>
              <div className={`urole ${roleClass[role] || ''}`}>
                {roleLabels[role] || role}
              </div>
            </div>
          </div>
          <button type="button" className="signout" onClick={onLogout} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
