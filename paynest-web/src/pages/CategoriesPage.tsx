import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Tag,
  PlusCircle,
  RefreshCw,
  Lock,
  Trash2,
  TrendingDown,
  TrendingUp,
  Search,
} from 'lucide-react';
import { categoriesApi } from '../api/categories';
import type { CategoryResponse } from '../types/finance';
import { AddCategoryModal } from '../components/categories/AddCategoryModal';
import { DeleteCategoryModal } from '../components/categories/DeleteCategoryModal';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const CategoriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryResponse | null>(null);

  const {
    data: categories,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getCategories(),
  });

  const filteredCategories = (categories || []).filter((cat) => {
    const matchesTab = activeTab === 'ALL' || cat.type === activeTab;
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const expenseCount = (categories || []).filter((c) => c.type === 'EXPENSE').length;
  const incomeCount = (categories || []).filter((c) => c.type === 'INCOME').length;

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
            Category Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '2px' }}>
            System default and custom categories for tagging income & expenses.
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
            Add Category
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Failed to load categories. Please ensure the backend is running."
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
            All ({categories?.length || 0})
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
            Expenses ({expenseCount})
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
            Income ({incomeCount})
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
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
            placeholder="Search category name..."
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

      {/* Category Grid */}
      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              style={{
                height: '90px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
              }}
            />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
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
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Tag size={28} color="var(--indigo-500)" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Categories Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', marginBottom: '20px' }}>
            {searchQuery
              ? `No categories matching "${searchQuery}"`
              : 'Add your own custom categories to organize transactions.'}
          </p>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <PlusCircle size={18} />
            Create Category
          </Button>
        </div>
      ) : (
        /* Grid of Categories */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredCategories.map((cat) => {
            const isExpense = cat.type === 'EXPENSE';
            const catColor = cat.color || (isExpense ? '#f43f5e' : '#10b981');

            return (
              <div
                key={cat.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  backdropFilter: 'blur(16px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                  {/* Category Color Dot & Icon Container */}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `${catColor}20`,
                      border: `1px solid ${catColor}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: catColor,
                      flexShrink: 0,
                    }}
                  >
                    <Tag size={20} color={catColor} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    >
                      {cat.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: isExpense ? 'var(--rose-500)' : 'var(--emerald-400)',
                      }}
                    >
                      {cat.type}
                    </span>
                  </div>
                </div>

                {/* Right side: System Default Lock or Delete Action */}
                <div>
                  {cat.isSystemDefault ? (
                    <div
                      title="System Default Category"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <Lock size={11} />
                      Default
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      title="Delete Custom Category"
                      style={{
                        background: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.2)',
                        color: 'var(--rose-500)',
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <DeleteCategoryModal
        category={deletingCategory}
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};
