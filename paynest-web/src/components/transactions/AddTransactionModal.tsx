import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Receipt,
  Sparkles,
  ArrowRight,
  Building2,
  Tag,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { transactionsApi } from '../../api/transactions';
import { accountsApi } from '../../api/accounts';
import { categoriesApi } from '../../api/categories';
import { aiApi } from '../../api/ai';
import { useAuth } from '../../hooks/useAuth';
import type { TransactionType } from '../../types/finance';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<number | ''>('');
  const [toAccountId, setToAccountId] = useState<number | ''>('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Accounts
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAccounts,
    enabled: isOpen,
  });

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
    enabled: isOpen,
  });

  // Set default account when accounts load
  useEffect(() => {
    if (accounts && accounts.length > 0 && accountId === '') {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  if (!isOpen) return null;

  // AI Auto-Categorization when Title changes
  const handleTitleBlur = async () => {
    if (!title.trim() || type === 'TRANSFER') return;

    try {
      setIsAiLoading(true);
      const res = await aiApi.categorize({
        title: title.trim(),
        amount: parseFloat(amount) || undefined,
      });

      if (res && res.suggestedCategory && categories) {
        setAiSuggestion(res.suggestedCategory);
        // Find matching category by name case-insensitive
        const matched = categories.find(
          (c) => c.name.toLowerCase() === res.suggestedCategory.toLowerCase()
        );
        if (matched) {
          setCategoryId(matched.id);
        }
      }
    } catch (e) {
      console.log('AI auto-categorization fallback');
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredCategories = (categories || []).filter(
    (c) => type === 'TRANSFER' || c.type === (type as any)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a transaction title');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    if (!accountId) {
      setError('Please select an account');
      return;
    }

    if (type === 'TRANSFER') {
      if (!toAccountId) {
        setError('Please select a destination account for transfer');
        return;
      }
      if (toAccountId === accountId) {
        setError('Source and destination accounts must be different');
        return;
      }
    }

    try {
      setIsLoading(true);
      await transactionsApi.createTransaction({
        title: title.trim(),
        amount: numAmount,
        type,
        accountId: Number(accountId),
        toAccountId: type === 'TRANSFER' && toAccountId ? Number(toAccountId) : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
        description: description.trim() || undefined,
        transactionDate: transactionDate ? new Date(transactionDate).toISOString() : undefined,
      });

      // Reset form
      setTitle('');
      setAmount('');
      setCategoryId('');
      setDescription('');
      setAiSuggestion(null);
      setError(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create transaction:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to log transaction. Please check details.';
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
          maxWidth: '520px',
          backgroundColor: '#0f1420',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
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

        {/* Modal Header */}
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
            <Receipt size={22} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>
              New Transaction
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Log income, expense, or account transfer
            </span>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {/* Transaction Type Pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Transaction Type
            </span>
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
              <button
                type="button"
                onClick={() => setType('EXPENSE')}
                style={{
                  padding: '9px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: type === 'EXPENSE' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
                  color: type === 'EXPENSE' ? 'var(--rose-500)' : 'var(--text-secondary)',
                  fontWeight: type === 'EXPENSE' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Expense
              </button>

              <button
                type="button"
                onClick={() => setType('INCOME')}
                style={{
                  padding: '9px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: type === 'INCOME' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: type === 'INCOME' ? 'var(--emerald-400)' : 'var(--text-secondary)',
                  fontWeight: type === 'INCOME' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Income
              </button>

              <button
                type="button"
                onClick={() => setType('TRANSFER')}
                style={{
                  padding: '9px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: type === 'TRANSFER' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                  color: type === 'TRANSFER' ? 'var(--indigo-500)' : 'var(--text-secondary)',
                  fontWeight: type === 'TRANSFER' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Title Input & AI Suggestion Badge */}
          <div>
            <Input
              label="Transaction Title"
              placeholder="e.g. Supermarket Groceries, Freelance Payment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              icon={<Receipt size={18} />}
              required
            />

            {/* AI Auto-Categorize Indicator */}
            {isAiLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.775rem', color: 'var(--emerald-400)' }}>
                <Loader2 className="animate-spin" size={14} />
                <span>AI analyzing title...</span>
              </div>
            ) : aiSuggestion ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.775rem', color: 'var(--emerald-400)' }}>
                <Sparkles size={14} color="var(--emerald-400)" />
                <span>AI suggested category: <strong>{aiSuggestion}</strong></span>
              </div>
            ) : null}
          </div>

          {/* Amount & Currency */}
          <Input
            label={`Amount (${user?.currency || 'LKR'})`}
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={<DollarSign size={18} />}
            required
          />

          {/* Account Selection */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label htmlFor="account-select" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {type === 'TRANSFER' ? 'From Account' : 'Account'}
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <select
                  id="account-select"
                  value={accountId}
                  onChange={(e) => setAccountId(Number(e.target.value))}
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
                  {(accounts || []).map((acc) => (
                    <option key={acc.id} value={acc.id} style={{ background: '#0f1420', color: '#fff' }}>
                      {acc.name} ({acc.currency} {acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Destination Account selector for TRANSFER */}
            {type === 'TRANSFER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                <label htmlFor="to-account-select" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  To Account
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                  <select
                    id="to-account-select"
                    value={toAccountId}
                    onChange={(e) => setToAccountId(Number(e.target.value))}
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
                    <option value="" style={{ background: '#0f1420' }}>Select Destination</option>
                    {(accounts || []).map((acc) => (
                      <option key={acc.id} value={acc.id} style={{ background: '#0f1420', color: '#fff' }}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Category Dropdown (if not transfer) */}
          {type !== 'TRANSFER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <label htmlFor="category-select" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Category
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Tag size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <select
                  id="category-select"
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
                  <option value="" style={{ background: '#0f1420' }}>Uncategorized</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: '#0f1420', color: '#fff' }}>
                      {c.name} {c.isSystemDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Transaction Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <label htmlFor="tx-date" style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Date & Time
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <input
                id="tx-date"
                type="datetime-local"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
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
                }}
              />
            </div>
          </div>

          {/* Optional Notes */}
          <Input
            label="Notes / Description (Optional)"
            placeholder="Additional details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            icon={<FileText size={18} />}
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} fullWidth>
              Save Transaction
              <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
