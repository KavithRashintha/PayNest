import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  Wallet,
  Tag,
  ArrowLeftRight,
  PieChart,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Accounts', path: '/accounts', icon: <Wallet size={20} /> },
    { name: 'Categories', path: '/categories', icon: <Tag size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <ArrowLeftRight size={20} /> },
    { name: 'Budgets', path: '/budgets', icon: <PieChart size={20} /> },
    { name: 'AI Advisor', path: '/ai-advisor', icon: <Sparkles size={20} />, isAi: true },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '280px',
          height: '100%',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Wallet size={20} color="#ffffff" />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#111827',
                }}
              >
                PayNest
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  color: isActive
                    ? '#4f46e5'
                    : item.isAi
                    ? '#059669'
                    : '#374151',
                  backgroundColor: isActive ? '#eef2ff' : 'transparent',
                  border: isActive ? '1px solid #c7d2fe' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div
          style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                {user?.fullName || 'User'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{user?.email}</span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--rose-500)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
      {/* Click outside backdrop to close */}
      <div style={{ flex: 1 }} onClick={onClose} />
    </div>
  );
};
