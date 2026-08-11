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
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      className="paynest-stat-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>
          {title}
        </span>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
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
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af' }}>
            {currency}
          </span>
          <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
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
