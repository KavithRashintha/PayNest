import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  PieChart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Tag,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  isAi?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { name: 'Dashboard',    path: '/dashboard',  icon: <LayoutDashboard size={19} /> },
    { name: 'Accounts',     path: '/accounts',   icon: <Wallet size={19} /> },
    { name: 'Categories',   path: '/categories', icon: <Tag size={19} /> },
    { name: 'Transactions', path: '/transactions', icon: <ArrowLeftRight size={19} /> },
    { name: 'Budgets',      path: '/budgets',    icon: <PieChart size={19} /> },
    { name: 'AI Advisor',   path: '/ai-advisor', icon: <Sparkles size={19} />, badge: 'AI', isAi: true },
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? '68px' : '252px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isCollapsed ? '20px 10px' : '20px 14px',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 40,
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            marginBottom: '28px',
            padding: isCollapsed ? '0' : '0 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Wallet size={20} color="#ffffff" />
            </div>

            {!isCollapsed && (
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  color: '#111827',
                  whiteSpace: 'nowrap',
                }}
              >
                PayNest
              </span>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav section label */}
        {!isCollapsed && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#9ca3af',
              padding: '0 4px',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Menu
          </span>
        )}

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '11px' : '9px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: isActive
                  ? '#4f46e5'
                  : item.isAi
                  ? '#059669'
                  : '#374151',
                backgroundColor: isActive
                  ? '#eef2ff'
                  : 'transparent',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s ease',
              })}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.classList.contains('active')) {
                  el.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                if (!el.classList.contains('active')) {
                  el.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                )}
              </div>

              {!isCollapsed && item.badge && (
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 'var(--radius-full)',
                    background: item.isAi ? 'var(--gradient-emerald)' : 'var(--gradient-primary)',
                    color: '#ffffff',
                    letterSpacing: '0.04em',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Section: User & Logout */}
      <div
        style={{
          borderTop: '1px solid #e5e7eb',
          paddingTop: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: isCollapsed ? '4px 0' : '6px 4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#ffffff',
                flexShrink: 0,
              }}
            >
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>

            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: '#111827',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {user?.fullName || 'User'}
                </span>
                <span
                  style={{
                    fontSize: '0.73rem',
                    color: '#9ca3af',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                  }}
                >
                  {user?.email}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '6px',
                borderRadius: '6px',
                transition: 'color 0.15s ease, background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#9ca3af';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
