import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Receipt,
  PlusCircle,
  RefreshCw,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { transactionsApi } from '../api/transactions';
import { useAuth } from '../hooks/useAuth';
import type { TransactionResponse, TransactionType } from '../types/finance';
import { AddTransactionModal } from '../components/transactions/AddTransactionModal';
import { DeleteTransactionModal } from '../components/transactions/DeleteTransactionModal';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [activeTab, setActiveTab] = useState<'ALL' | TransactionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionResponse | null>(null);

  const {
    data: pageData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => transactionsApi.getTransactions(page, pageSize),
  });

  const transactions = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;

  const filteredTransactions = transactions.filter((t) => {
    const matchesTab = activeTab === 'ALL' || t.type === activeTab;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.categoryName && t.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.accountName && t.accountName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
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
            Transactions Log
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '2px' }}>
            View and manage all income, expenses, and account transfers.
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
            New Transaction
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Failed to load transaction history. Please ensure the backend service is active."
          onClose={() => {}}
        />
      )}

      {/* Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Type Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setActiveTab('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'ALL' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: activeTab === 'ALL' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            All
          </button>

          <button
            onClick={() => setActiveTab('EXPENSE')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'EXPENSE' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
              color: activeTab === 'EXPENSE' ? 'var(--rose-500)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'EXPENSE' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <TrendingDown size={14} />
            Expenses
          </button>

          <button
            onClick={() => setActiveTab('INCOME')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'INCOME' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'INCOME' ? 'var(--emerald-400)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'INCOME' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <TrendingUp size={14} />
            Income
          </button>

          <button
            onClick={() => setActiveTab('TRANSFER')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              backgroundColor: activeTab === 'TRANSFER' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              color: activeTab === 'TRANSFER' ? 'var(--indigo-500)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'TRANSFER' ? 700 : 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeftRight size={14} />
            Transfers
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Filter title, category, account..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="paynest-input"
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Transactions Table / List Container */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)',
          overflow: 'hidden',
        }}
      >
        {isLoading ? (
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: '56px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                }}
              />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          /* Empty State */
          <div
            style={{
              padding: '56px 24px',
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
              <Receipt size={30} color="var(--indigo-500)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
              No Transactions Found
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', marginBottom: '20px' }}>
              {searchQuery
                ? `No transactions matching "${searchQuery}"`
                : 'Log income, expenses, or transfers to build your history.'}
            </p>
            <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
              <PlusCircle size={18} />
              Log Transaction
            </Button>
          </div>
        ) : (
          /* Transactions Rows */
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTransactions.map((t, idx) => {
              const isIncome = t.type === 'INCOME';
              const isTransfer = t.type === 'TRANSFER';

              const formattedAmount = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(t.amount);

              const formattedDate = new Date(t.transactionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom:
                      idx < filteredTransactions.length - 1
                        ? '1px solid var(--border-subtle)'
                        : 'none',
                    transition: 'background-color 0.2s ease',
                  }}
                  className="paynest-table-row"
                >
                  {/* Left: Icon, Title, Category & Account */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
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
                        <ArrowDownLeft size={22} />
                      ) : isTransfer ? (
                        <ArrowLeftRight size={22} />
                      ) : (
                        <ArrowUpRight size={22} />
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {t.title}
                        </span>

                        {t.categoryName && (
                          <span
                            style={{
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: `${t.categoryColor || '#6366f1'}20`,
                              color: t.categoryColor || '#818cf8',
                              border: `1px solid ${t.categoryColor || '#6366f1'}40`,
                            }}
                          >
                            {t.categoryName}
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {isTransfer
                          ? `${t.accountName || 'Account'} ➔ ${t.toAccountName || 'Destination'}`
                          : t.accountName || 'Account'}{' '}
                        • {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount & Delete Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: isIncome
                            ? 'var(--emerald-400)'
                            : isTransfer
                            ? 'var(--text-primary)'
                            : 'var(--rose-500)',
                        }}
                      >
                        {isIncome ? '+' : isTransfer ? '' : '-'} {user?.currency || 'LKR'}{' '}
                        {formattedAmount}
                      </span>
                    </div>

                    <button
                      onClick={() => setDeletingTransaction(t)}
                      title="Delete Transaction"
                      style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        color: 'var(--rose-500)',
                        padding: '7px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <DeleteTransactionModal
        transaction={deletingTransaction}
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
