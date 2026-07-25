import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  PieChart,
  Tag,
  DollarSign,
  Calendar,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { budgetsApi } from '../../api/budgets';
import { categoriesApi } from '../../api/categories';
import { useAuth } from '../../hooks/useAuth';
import type { BudgetPeriod } from '../../types/finance';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BUDGET_PERIODS: { period: BudgetPeriod; label: string }[] = [
  { period: 'MONTHLY', label: 'Monthly' },
  { period: 'WEEKLY', label: 'Weekly' },
  { period: 'YEARLY', label: 'Yearly' },
];

export const AddBudgetModal: React.FC<AddBudgetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [amountLimit, setAmountLimit] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('MONTHLY');

  // Default dates: First and last day of current month
  const now = new Date();
  const firstDayStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDayStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(lastDayStr);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch expense categories
  const { data: categories } = useQuery({
    queryKey: ['categories', 'EXPENSE'],
    queryFn: () => categoriesApi.getCategories('EXPENSE'),
    enabled: isOpen,
  });

  // Automatically select first category on load
  useEffect(() => {
    if (categories && categories.length > 0 && categoryId === '') {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  // Adjust dates when period changes
  const handlePeriodChange = (newPeriod: BudgetPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();
    if (newPeriod === 'WEEKLY') {
      const start = new Date(today);
      const end = new Date(today);
      end.setDate(today.getDate() + 7);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
    } else if (newPeriod === 'MONTHLY') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
    } else if (newPeriod === 'YEARLY') {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      setStartDate(start.toISOString().slice(0, 10));
      setEndDate(end.toISOString().slice(0, 10));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Please select a category for the budget');
      return;
    }

    const numLimit = parseFloat(amountLimit);
    if (isNaN(numLimit) || numLimit <= 0) {
      setError('Please enter a valid budget limit amount greater than 0');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date');
      return;
    }

    try {
      setIsLoading(true);
      await budgetsApi.createBudget({
        categoryId: Number(categoryId),
        amountLimit: numLimit,
        period,
        startDate,
        endDate,
      });

      // Reset form
      setAmountLimit('');
      setError(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create budget:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to set budget limit. A budget for this category may already exist.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#0f1420',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
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
            <PieChart size={22} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
              Create Budget Limit
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Set a spending cap on categories to control expenses
            </span>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {/* Category Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <label htmlFor="budget-category" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Target Category
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Tag size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <select
                id="budget-category"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="paynest-input"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  backgroundColor: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {(categories || []).map((cat) => (
                  <option key={cat.id} value={cat.id} style={{ background: '#0f1420', color: '#fff' }}>
                    {cat.name} {cat.isSystemDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount Limit */}
          <Input
            label={`Spending Limit Amount (${user?.currency || 'LKR'})`}
            type="number"
            step="0.01"
            placeholder="e.g. 50000.00"
            value={amountLimit}
            onChange={(e) => setAmountLimit(e.target.value)}
            icon={<DollarSign size={18} />}
            required
          />

          {/* Period Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Budget Period
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                padding: '4px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {BUDGET_PERIODS.map((p) => (
                <button
                  key={p.period}
                  type="button"
                  onClick={() => handlePeriodChange(p.period)}
                  style={{
                    padding: '8px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: period === p.period ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                    color: period === p.period ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: period === p.period ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Pickers */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label htmlFor="start-date" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Start Date
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="paynest-input"
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 36px',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label htmlFor="end-date" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                End Date
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Clock size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="paynest-input"
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 36px',
                    backgroundColor: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} fullWidth>
              Save Budget
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
