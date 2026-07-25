import React from 'react';

interface StatCardProps {
  title: string;
  amount: number;
  currency?: string;
  icon: React.ReactNode;
  trendLabel?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  currency = 'LKR',
  icon,
  trendLabel,
  trendType = 'neutral',
  accentColor = 'var(--indigo-500)',
}) => {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  const getTrendStyle = () => {
    switch (trendType) {
      case 'positive':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          color: 'var(--emerald-400)',
        };
      case 'negative':
        return {
          bg: 'rgba(244, 63, 94, 0.15)',
          color: 'var(--rose-500)',
        };
      default:
        return {
          bg: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--indigo-500)',
        };
    }
  };

  const trendStyle = getTrendStyle();

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.25s ease, border-color 0.25s ease',
      }}
      className="paynest-stat-card"
    >
      {/* Decorative Glow Corner */}
      <div
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentColor} 0%, rgba(0,0,0,0) 70%)`,
          opacity: 0.2,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {currency}
          </span>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {formattedAmount}
          </span>
        </div>

        {trendLabel && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: trendStyle.bg,
                color: trendStyle.color,
              }}
            >
              {trendLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
