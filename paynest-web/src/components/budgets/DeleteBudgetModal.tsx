import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { budgetsApi } from '../../api/budgets';
import type { BudgetStatusResponse } from '../../types/finance';

interface DeleteBudgetModalProps {
  budgetStatus: BudgetStatusResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteBudgetModal: React.FC<DeleteBudgetModalProps> = ({
  budgetStatus,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !budgetStatus) return null;

  const budget = budgetStatus.budget;

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await budgetsApi.deleteBudget(budget.id);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to delete budget:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to delete budget limit. Please try again.';
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
          maxWidth: '420px',
          backgroundColor: '#0f1420',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          position: 'relative',
        }}
      >
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

        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
            }}
          >
            <AlertTriangle size={28} color="var(--rose-500)" />
          </div>

          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700, marginBottom: '8px' }}>
            Delete Budget Limit?
          </h3>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Are you sure you want to remove the budget for <strong>{budget.categoryName || 'Category'}</strong>?
          </p>

          {error && (
            <div style={{ marginBottom: '16px', textAlign: 'left' }}>
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              isLoading={isLoading}
              fullWidth
              style={{
                background: 'var(--rose-500)',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.35)',
              }}
            >
              <Trash2 size={16} />
              Delete Budget
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
