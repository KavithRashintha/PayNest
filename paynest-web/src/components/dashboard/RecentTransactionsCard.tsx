import React from 'react';
import type { TransactionResponse } from '../../types/finance';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Receipt } from 'lucide-react';

interface RecentTransactionsCardProps {
  transactions: TransactionResponse[];
  currency?: string;
  onViewAll?: () => void;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  currency = 'LKR',
  onViewAll,
}) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div
        style={{
          padding: '32px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '340px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
          }}
        >
          <Receipt size={24} color="var(--indigo-500)" />
        </div>
        <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          No Transactions Recorded
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Your recent activities will show up here once you log income or expenses.
        </p>
      </div>
    );
  }

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
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recent Transactions
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Latest account activity
          </span>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--indigo-500)',
              cursor: 'pointer',
            }}
          >
            View All →
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
        {transactions.slice(0, 5).map((t) => {
          const isIncome = t.type === 'INCOME';
          const isTransfer = t.type === 'TRANSFER';

          const formattedAmount = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(t.amount);

          const formattedDate = new Date(t.transactionDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                transition: 'background-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: isIncome
                      ? 'rgba(16, 185, 129, 0.15)'
                      : isTransfer
                      ? 'rgba(99, 102, 241, 0.15)'
                      : 'rgba(244, 63, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isIncome
                      ? 'var(--emerald-400)'
                      : isTransfer
                      ? 'var(--indigo-500)'
                      : 'var(--rose-500)',
                    flexShrink: 0,
                  }}
                >
                  {isIncome ? (
                    <ArrowDownLeft size={20} />
                  ) : isTransfer ? (
                    <ArrowLeftRight size={20} />
                  ) : (
                    <ArrowUpRight size={20} />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.title}
                  </span>
                  <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {t.categoryName || 'General'} • {t.accountName || 'Account'} • {formattedDate}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: isIncome
                      ? 'var(--emerald-400)'
                      : isTransfer
                      ? 'var(--text-primary)'
                      : 'var(--rose-500)',
                  }}
                >
                  {isIncome ? '+' : isTransfer ? '' : '-'} {currency} {formattedAmount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
