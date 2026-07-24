import React from 'react';
import { Menu, LogOut, Wallet, Bell, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { financeApi } from '../../api/finance';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();

  const { data: summary } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: financeApi.getSummary,
    staleTime: 30000,
    retry: false,
  });

  const totalBalance = summary?.totalBalance ?? 0;

  const formattedBalance = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalBalance);

  return (
    <header
      style={{
        height: '64px',
        width: '100%',
        backgroundColor: 'rgba(15, 20, 32, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            aria-label="Toggle mobile menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
            }}
          >
            <Menu size={22} />
          </button>
        )}

        {/* Global Search Bar */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '240px',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search transactions..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none',
            }}
            className="paynest-input"
          />
        </div>
      </div>

      {/* Right: Balance Summary, Notifications, User Avatar & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {/* Quick Net Worth Balance Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Wallet size={14} color="var(--emerald-400)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', lineHeight: 1 }}>
              Net Worth
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
              {user?.currency || 'LKR'} {formattedBalance}
            </span>
          </div>
        </div>

        {/* Notifications Icon */}
        <button
          title="Notifications"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: '6px',
          }}
        >
          <Bell size={19} />
          <span
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--rose-500)',
            }}
          />
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-subtle)' }} />

        {/* User Profile & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
              }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {user?.fullName || 'User'}
              </span>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                {user?.email}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--rose-500)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
