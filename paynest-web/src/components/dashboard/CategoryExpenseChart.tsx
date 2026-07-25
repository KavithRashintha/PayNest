import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategorySpendSummary } from '../../types/finance';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryExpenseChartProps {
  categories: CategorySpendSummary[];
  currency?: string;
}

const DEFAULT_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#ec4899', // Pink
];

export const CategoryExpenseChart: React.FC<CategoryExpenseChartProps> = ({
  categories,
  currency = 'LKR',
}) => {
  if (!categories || categories.length === 0) {
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
          <PieChartIcon size={24} color="var(--indigo-500)" />
        </div>
        <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
          No Expense Data Yet
        </h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Start adding transactions to visualize your spending breakdown.
        </p>
      </div>
    );
  }

  const chartData = categories.map((cat, index) => ({
    name: cat.categoryName,
    value: cat.totalSpent,
    percentage: cat.percentageOfTotal,
    color: cat.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
  }));

  const totalExpense = categories.reduce((sum, item) => sum + item.totalSpent, 0);

  const formattedTotal = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalExpense);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Expenses by Category
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Spending distribution for current period
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Donut Chart */}
        <div style={{ width: '220px', height: '220px', position: 'relative', margin: '0 auto' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div
                        style={{
                          backgroundColor: '#0f1420',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 14px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: data.color }}>
                          {data.name}
                        </span>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                          {currency} {data.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {data.percentage.toFixed(1)}% of total
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Label */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total
            </span>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {formattedTotal}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}>
          {chartData.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</span>
              </div>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
