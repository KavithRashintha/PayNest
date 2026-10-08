import React from 'react';
import { ShieldCheck, Sparkles, TrendingUp, Wallet } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '24px',
        background: '#f7f8fa',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background accents */}
      <div
        style={{
          position: 'absolute', top: '-10%', left: '-8%',
          width: '480px', height: '480px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.07) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: '-10%', right: '-8%',
          width: '560px', height: '560px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />

      {/* Main Card Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '1020px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
        }}
        className="animate-fade-in"
      >
        {/* Left Brand Panel */}
        <div
          style={{
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* subtle inner glow */}
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />

          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '36px' }}>
              <div
                style={{
                  width: '42px', height: '42px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
                }}
              >
                <Wallet size={22} color="#ffffff" />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.4rem', fontWeight: 800,
                letterSpacing: '-0.03em', color: '#ffffff',
              }}>
                PayNest
              </span>
            </div>

            <h2 style={{ fontSize: '1.8rem', lineHeight: 1.25, fontWeight: 700, color: '#ffffff', marginBottom: '14px' }}>
              Smart Wealth &<br />
              <span style={{
                background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                AI Financial Copilot
              </span>
            </h2>

            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.65 }}>
              Track income, budget smartly with live balance metrics, and unlock personalized AI insights for optimal savings.
            </p>
          </div>

          {/* Feature Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '36px' }}>
            {[
              { icon: <Sparkles size={15} />, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', label: 'Instant AI Expense Categorization' },
              { icon: <TrendingUp size={15} />, color: '#10b981', bg: 'rgba(16,185,129,0.15)', label: 'Real-time Budget Monitoring & Alerts' },
              { icon: <ShieldCheck size={15} />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', label: 'Bank-Grade JWT Multi-Service Security' },
            ].map(({ icon, color, bg, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ color }}>{icon}</span>
                </div>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop: '40px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>
              © 2026 PayNest Finance Platform. All rights reserved.
            </span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div
          style={{
            padding: '48px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
              {title}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
