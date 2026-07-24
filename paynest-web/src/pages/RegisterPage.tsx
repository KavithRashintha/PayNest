import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Coins, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';

const CURRENCIES = [
  { code: 'LKR', label: 'LKR - Sri Lankan Rupee (Default)' },
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'AUD', label: 'AUD - Australian Dollar' },
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
  { code: 'SGD', label: 'SGD - Singapore Dollar' },
];

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('LKR');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        currency,
      });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed. Email may already be in use.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking expenses and managing budgets smarter"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={<UserIcon size={18} />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} />}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock size={18} />}
          required
          autoComplete="new-password"
        />

        {/* Currency Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
          <label
            htmlFor="currency-select"
            style={{
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            Base Currency
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
            <div
              style={{
                position: 'absolute',
                left: '14px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              <Coins size={18} />
            </div>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
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
                appearance: 'none',
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

        <Button type="submit" size="lg" isLoading={isLoading} fullWidth style={{ marginTop: '6px' }}>
          Create Free Account
          <ArrowRight size={18} />
        </Button>

        <div
          style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginTop: '8px',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--indigo-500)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
