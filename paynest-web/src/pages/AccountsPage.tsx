import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  Building2,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Shield,
  Banknote,
  PlusCircle,
  Edit2,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { accountsApi } from '../api/accounts';
import { useAuth } from '../hooks/useAuth';
import type { AccountResponse, AccountType } from '../types/finance';
import { AddAccountModal } from '../components/accounts/AddAccountModal';
import { EditAccountModal } from '../components/accounts/EditAccountModal';
import { DeleteAccountModal } from '../components/accounts/DeleteAccountModal';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const AccountsPage: React.FC = () => {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountResponse | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<AccountResponse | null>(null);

  const {
    data: accounts,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAccounts,
  });

  const totalBalance = (accounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const formattedTotal = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalBalance);

  const getAccountTypeDetails = (type: AccountType) => {
    switch (type) {
      case 'BANK':
        return {
          label: 'Bank Account',
          icon: <Building2 size={22} color="#6366f1" />,
          bgColor: 'rgba(99, 102, 241, 0.15)',
          badgeColor: '#818cf8',
        };
      case 'CASH':
        return {
          label: 'Cash / Wallet',
          icon: <Banknote size={22} color="#10b981" />,
          bgColor: 'rgba(16, 185, 129, 0.15)',
          badgeColor: '#34d399',
        };
      case 'CREDIT_CARD':
        return {
          label: 'Credit Card',
          icon: <CreditCard size={22} color="#f43f5e" />,
          bgColor: 'rgba(244, 63, 94, 0.15)',
          badgeColor: '#fb7185',
        };
      case 'SAVINGS':
        return {
          label: 'Savings',
          icon: <PiggyBank size={22} color="#f59e0b" />,
          bgColor: 'rgba(245, 158, 11, 0.15)',
          badgeColor: '#fbbf24',
        };
      case 'INVESTMENT':
        return {
          label: 'Investment',
          icon: <TrendingUp size={22} color="#8b5cf6" />,
          bgColor: 'rgba(139, 92, 246, 0.15)',
          badgeColor: '#a78bfa',
        };
      default:
        return {
          label: 'Other Account',
          icon: <Shield size={22} color="#06b6d4" />,
          bgColor: 'rgba(6, 182, 212, 0.15)',
          badgeColor: '#22d3ee',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header & Quick Action */}
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
            Financial Accounts
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '2px' }}>
            Manage bank accounts, credit cards, cash, and investments.
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
            Add Account
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Failed to load account details. Please check your connection."
          onClose={() => {}}
        />
      )}

      {/* Aggregate Balance Banner Card */}
      <div
        style={{
          padding: '24px 32px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.9) 0%, rgba(12, 17, 29, 0.95) 100%)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
            }}
          >
            <Wallet size={28} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Total Portfolio Balance
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              {user?.currency || 'LKR'} {formattedTotal}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Accounts</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--indigo-500)' }}>
              {accounts?.length || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: '160px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            />
          ))}
        </div>
      ) : !accounts || accounts.length === 0 ? (
        /* Empty State */
        <div
          style={{
            padding: '48px 24px',
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
            <Wallet size={30} color="var(--indigo-500)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Accounts Added Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', marginBottom: '20px' }}>
            Create your first bank account, cash wallet, or savings account to start tracking transactions.
          </p>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle size={18} />
            Create Account
          </Button>
        </div>
      ) : (
        /* Accounts Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '20px',
          }}
        >
          {accounts.map((acc) => {
            const details = getAccountTypeDetails(acc.type);
            const formattedBalance = new Intl.NumberFormat('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(acc.balance || 0);

            return (
              <div
                key={acc.id}
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '20px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {/* Card Top: Icon & Type Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: details.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {details.icon}
                  </div>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: details.bgColor,
                      color: details.badgeColor,
                    }}
                  >
                    {details.label}
                  </span>
                </div>

                {/* Card Body: Name & Balance */}
                <div>
                  <h3
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}
                  >
                    {acc.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {acc.currency || user?.currency || 'LKR'}
                    </span>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: acc.balance < 0 ? 'var(--rose-500)' : 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {formattedBalance}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <button
                    onClick={() => setEditingAccount(acc)}
                    title="Edit Account"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
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
                    <Edit2 size={14} />
                    Edit
                  </button>

                  <button
                    onClick={() => setDeletingAccount(acc)}
                    title="Delete Account"
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
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <EditAccountModal
        account={editingAccount}
        isOpen={!!editingAccount}
        onClose={() => setEditingAccount(null)}
        onSuccess={() => refetch()}
      />

      <DeleteAccountModal
        account={deletingAccount}
        isOpen={!!deletingAccount}
        onClose={() => setDeletingAccount(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
