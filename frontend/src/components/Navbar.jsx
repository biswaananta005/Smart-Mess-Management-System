import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, LogOut, User as UserIcon, Shield } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'badge-admin';
      case 'authority': return 'badge-authority';
      default: return 'badge-student';
    }
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo-icon">
            <UtensilsCrossed size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Smart Mess</span>
            <span className="brand-sub">Management System</span>
          </div>
        </div>

        {user && (
          <div className="navbar-user-actions">
            <div className="user-profile-card">
              <div className="user-avatar">
                <UserIcon size={18} />
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <button className="logout-btn" onClick={logout} title="Sign Out">
              <LogOut size={18} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
