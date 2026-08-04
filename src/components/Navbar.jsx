import { Search, Bell, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { admin } = useAuth();

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="navbar-hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="navbar-search">
          <Search size={16} className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search..."
            className="navbar-search-input"
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="navbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="navbar-notif-dot" />
        </button>

        <div className="navbar-avatar">
          <div className="navbar-avatar-inner">
            {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="navbar-avatar-info">
            <p className="navbar-avatar-name">{admin?.name || 'Admin'}</p>
            <p className="navbar-avatar-role">{admin?.role || 'Administrator'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
