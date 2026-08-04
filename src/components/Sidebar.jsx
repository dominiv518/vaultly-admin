import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, BarChart3, FolderGit2, Bell,
  MessageSquare, Terminal, ShieldCheck, Settings,
  LogOut, X
} from 'lucide-react';

const navSections = [
  {
    label: 'Main',
    items: [
      { to: '/',            label: 'Dashboard',     icon: LayoutDashboard },
      { to: '/users',       label: 'Users',         icon: Users },
      { to: '/analytics',   label: 'Analytics',     icon: BarChart3 },
      { to: '/versions',    label: 'App Versions',  icon: FolderGit2 },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/feedback',      label: 'Feedback',      icon: MessageSquare },
      { to: '/logs',          label: 'Logs',          icon: Terminal },
      { to: '/admins',        label: 'Admin Accounts',icon: ShieldCheck },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar__logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0
            }}>
              V
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#F0F6FF', letterSpacing: '-0.02em' }}>
              Vaultly
            </span>
          </div>
          <button onClick={onClose} className="sidebar-close-btn" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="nav-section-label">{section.label}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {isActive && <span className="nav-dot" />}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button
            onClick={logout}
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}
