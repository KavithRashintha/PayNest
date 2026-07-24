import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Invalid email or password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your financial dashboard and AI copilot"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

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

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            required
            autoComplete="current-password"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Password reset link has been requested.');
              }}
              style={{ fontSize: '0.8rem', color: 'var(--indigo-500)', textDecoration: 'none' }}
            >
              Forgot password?
            </a>
          </div>
        </div>

        <Button type="submit" size="lg" isLoading={isLoading} fullWidth>
          Sign In to PayNest
          <ArrowRight size={18} />
        </Button>

        <div
          style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginTop: '12px',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--indigo-500)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};
