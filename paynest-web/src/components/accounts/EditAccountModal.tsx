import React, { useState, useEffect } from 'react';
import { X, Edit3, Building2, Coins, DollarSign, Save } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { accountsApi } from '../../api/accounts';
import type { AccountResponse, AccountType } from '../../types/finance';

interface EditAccountModalProps {
  account: AccountResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACCOUNT_TYPES: { type: AccountType; label: string }[] = [
  { type: 'BANK', label: 'Bank Account' },
  { type: 'CASH', label: 'Cash / Wallet' },
  { type: 'CREDIT_CARD', label: 'Credit Card' },
  { type: 'SAVINGS', label: 'Savings Account' },
  { type: 'INVESTMENT', label: 'Investment Portfolio' },
  { type: 'OTHER', label: 'Other Account' },
];

const CURRENCIES = [
  { code: 'LKR', label: 'LKR - Sri Lankan Rupee (Default)' },
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'AUD', label: 'AUD - Australian Dollar' },
  { code: 'CAD', label: 'CAD - Canadian Dollar' },
  { code: 'SGD', label: 'SGD - Singapore Dollar' },
];

export const EditAccountModal: React.FC<EditAccountModalProps> = ({
  account,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('BANK');
  const [balance, setBalance] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('LKR');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setType(account.type || 'BANK');
      setBalance(account.balance?.toString() || '0');
      setCurrency(account.currency || 'LKR');
      setError(null);
    }
  }, [account]);

  if (!isOpen || !account) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter an account name');
      return;
    }

    const numBalance = parseFloat(balance);
    if (isNaN(numBalance)) {
      setError('Please enter a valid balance number');
      return;
    }

    try {
      setIsLoading(true);
      await accountsApi.updateAccount(account.id, {
        name: name.trim(),
        type,
        balance: numBalance,
        currency,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to update account:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update account details. Please try again.';
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
          maxWidth: '460px',
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
            <Edit3 size={20} color="#ffffff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: 700 }}>Edit Account</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Update details for {account.name}
            </span>
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          {/* Account Name */}
          <Input
            label="Account Name"
            placeholder="Account Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<Building2 size={18} />}
            required
          />

          {/* Account Type */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <label
              htmlFor="edit-account-type"
              style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Account Type
            </label>
            <select
              id="edit-account-type"
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="paynest-input"
              style={{
                width: '100%',
                padding: '12px 14px',
                backgroundColor: 'var(--bg-input)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.925rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.type} value={t.type} style={{ background: '#0f1420', color: '#fff' }}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Current Balance */}
          <Input
            label="Account Balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            icon={<DollarSign size={18} />}
            required
          />

          {/* Currency Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <label
              htmlFor="edit-account-currency"
              style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}
            >
              Currency
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Coins size={18} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
              <select
                id="edit-account-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="paynest-input"
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

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} fullWidth>
              Save Changes
              <Save size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
