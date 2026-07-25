import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  PieChart,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Calendar,
  Tag,
} from 'lucide-react';
import { budgetsApi } from '../api/budgets';
import { useAuth } from '../hooks/useAuth';
import type { BudgetStatusResponse } from '../types/finance';
import { AddBudgetModal } from '../components/budgets/AddBudgetModal';
import { DeleteBudgetModal } from '../components/budgets/DeleteBudgetModal';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const BudgetsPage: React.FC = () => {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingBudgetStatus, setDeletingBudgetStatus] = useState<BudgetStatusResponse | null>(null);

  const {
    data: budgetsStatus,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['budgetsStatus'],
    queryFn: budgetsApi.getBudgetsStatus,
  });

  const currency = user?.currency || 'LKR';
  const totalBudgets = budgetsStatus?.length || 0;
  const totalLimit = (budgetsStatus || []).reduce((sum, item) => sum + item.budget.amountLimit, 0);
  const totalSpent = (budgetsStatus || []).reduce((sum, item) => sum + item.spentAmount, 0);
  const exceededCount = (budgetsStatus || []).filter((item) => item.isExceeded).length;

  const formattedTotalLimit = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalLimit);

  const formattedTotalSpent = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalSpent);

  const getProgressColor = (percentage: number, isExceeded: boolean) => {
    if (isExceeded || percentage >= 90) return 'var(--rose-500)';
    if (percentage >= 65) return 'var(--amber-500)';
    return 'var(--emerald-500)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Budget Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '2px' }}>
            Set category spending caps and monitor real-time usage.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
          >
            <RefreshCw size={16} />
            Refresh
          </Button>

          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle size={16} />
            Create Budget
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Failed to load budget status. Please ensure the backend finance service is online."
          onClose={() => {}}
        />
      )}

      {/* Summary Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Budget Limit</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {currency} {formattedTotalLimit}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Spent</span>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: totalSpent > totalLimit && totalLimit > 0 ? 'var(--rose-500)' : 'var(--emerald-400)',
              marginTop: '4px',
            }}
          >
            {currency} {formattedTotalSpent}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Caps</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--indigo-500)', marginTop: '4px' }}>
            {totalBudgets} Categories
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Over-Budget Alerts</span>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: exceededCount > 0 ? 'var(--rose-500)' : 'var(--emerald-400)',
              marginTop: '4px',
            }}
          >
            {exceededCount} Warning{exceededCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '200px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            />
          ))}
        </div>
      ) : !budgetsStatus || budgetsStatus.length === 0 ? (
        /* Empty State */
        <div
          style={{
            padding: '56px 24px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <PieChart size={30} color="var(--indigo-500)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Budgets Configured
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', marginBottom: '20px' }}>
            Set up monthly or weekly spending limits on your categories to keep expenses on track.
          </p>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle size={18} />
            Create Budget Limit
          </Button>
        </div>
      ) : (
        /* Grid of Budget Cards */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {budgetsStatus.map((item) => {
            const b = item.budget;
            const percentage = Math.min(100, Math.max(0, item.percentageUsed));
            const progressColor = getProgressColor(percentage, item.isExceeded);

            const formattedSpent = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(item.spentAmount);

            const formattedLimit = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(b.amountLimit);

            const formattedRemaining = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(Math.abs(item.remainingAmount));

            return (
              <div
                key={b.id}
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-card)',
                  border: item.isExceeded
                    ? '1px solid rgba(244, 63, 94, 0.4)'
                    : '1px solid var(--border-subtle)',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                  position: 'relative',
                }}
              >
                {/* Top: Category Title & Period Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: `${b.categoryColor || '#6366f1'}20`,
                        border: `1px solid ${b.categoryColor || '#6366f1'}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: b.categoryColor || '#818cf8',
                      }}
                    >
                      <Tag size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {b.categoryName || 'Category'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        <span>{b.startDate} to {b.endDate}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--indigo-500)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    {b.period}
                  </span>
                </div>

                {/* Middle: Progress Bar & Spend Figures */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Spent: <strong style={{ color: '#ffffff' }}>{currency} {formattedSpent}</strong>
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Limit: {currency} {formattedLimit}
                    </span>
                  </div>

                  {/* Progress Track */}
                  <div
                    style={{
                      height: '10px',
                      width: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percentage}%`,
                        backgroundColor: progressColor,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: progressColor }}>
                      {item.percentageUsed.toFixed(1)}% Used
                    </span>

                    {item.isExceeded ? (
                      <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--rose-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={13} />
                        Over by {currency} {formattedRemaining}
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={13} color="var(--emerald-400)" />
                        {currency} {formattedRemaining} remaining
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => setDeletingBudgetStatus(item)}
                    title="Delete Budget Limit"
                    style={{
                      background: 'rgba(244, 63, 94, 0.1)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      color: 'var(--rose-500)',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Trash2 size={14} />
                    Delete Limit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <DeleteBudgetModal
        budgetStatus={deletingBudgetStatus}
        isOpen={!!deletingBudgetStatus}
        onClose={() => setDeletingBudgetStatus(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
