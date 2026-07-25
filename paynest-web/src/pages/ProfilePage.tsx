import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Coins,
  Shield,
  Save,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usersApi } from '../api/users';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

const CURRENCIES = [
  { code: 'LKR', label: 'LKR - Sri Lankan Rupee (Default)' },
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'AUD', label: 'AUD - Australian Dollar' },
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
  { code: 'SGD', label: 'SGD - Singapore Dollar' },
];

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currency, setCurrency] = useState(user?.currency || 'LKR');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setCurrency(user.currency || 'LKR');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full name cannot be blank');
      return;
    }

    try {
      setIsLoading(true);
      const updatedUser = await usersApi.updateProfile({
        fullName: fullName.trim(),
        currency,
      });

      // Sync local storage user state
      localStorage.setItem('paynest_user', JSON.stringify(updatedUser));
      setSuccessMsg('Profile settings updated successfully!');
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save profile changes. Please try again.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          User Profile & Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '2px' }}>
          Manage your account credentials, preferences, and base currency.
        </p>
      </div>

      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />}
      {errorMsg && <Alert type="error" message={errorMsg} onClose={() => setErrorMsg(null)} />}

      {/* User Info Overview Banner */}
      <div
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#ffffff',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            flexShrink: 0,
          }}
        >
          {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {user?.fullName || 'User'}
          </h2>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user?.email}</span>
        </div>

        <div
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="var(--emerald-400)" />
          <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
            JWT Authenticated
          </span>
        </div>
      </div>

      {/* Profile Form Card */}
      <div
        style={{
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Account Details
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<UserIcon size={18} />}
            required
          />

          <Input
            label="Email Address (Read-only)"
            type="email"
            value={user?.email || ''}
            disabled
            icon={<Mail size={18} />}
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          />

          {/* Preferred Base Currency */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <label htmlFor="pref-currency" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Preferred Base Currency
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Coins size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <select
                id="pref-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="paynest-input"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.925rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: '#0f1420', color: '#fff' }}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <Button type="submit" isLoading={isLoading}>
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Security & Session Card */}
      <div
        style={{
          padding: '24px 28px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={22} color="var(--indigo-500)" />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Session
            </h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Signed in as {user?.email}
            </span>
          </div>
        </div>

        <Button variant="secondary" onClick={logout} style={{ color: 'var(--rose-500)', borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <LogOut size={16} />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
