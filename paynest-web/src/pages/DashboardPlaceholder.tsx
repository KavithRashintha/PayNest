import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { LogOut, User as UserIcon, Wallet } from 'lucide-react';

export const DashboardPlaceholder: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '800px',
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)',
        }}
        className="animate-fade-in"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Wallet size={22} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700 }}>PayNest Workspace</h1>
          </div>
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut size={16} />
            Sign Out
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid var(--indigo-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserIcon size={28} color="var(--indigo-500)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Hello, {user?.fullName || 'User'}!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user?.email}</p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '24px',
          }}
        >
          <div
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Base Currency</span>
            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--emerald-400)', marginTop: '4px' }}>
              {user?.currency || 'LKR'}
            </p>
          </div>
          <div
            style={{
              padding: '20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auth Status</span>
            <p style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--indigo-500)', marginTop: '4px' }}>
              Authenticated JWT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
