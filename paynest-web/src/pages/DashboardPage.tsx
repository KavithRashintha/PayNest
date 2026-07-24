import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { analyticsApi } from '../api/analytics';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/dashboard/StatCard';
import { CategoryExpenseChart } from '../components/dashboard/CategoryExpenseChart';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: summary,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['financialSummary'],
    queryFn: analyticsApi.getFinancialSummary,
    staleTime: 30000,
  });

  const currency = user?.currency || 'LKR';

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const totalBalance = summary?.totalBalance ?? 0;
  const monthlyIncome = summary?.monthlyIncome ?? 0;
  const monthlyExpense = summary?.monthlyExpense ?? 0;
  const netSavings = summary?.netSavings ?? 0;

  // Calculate Savings Rate %
  const savingsRate =
    monthlyIncome > 0 ? Math.max(0, ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Top Banner & Quick Actions */}
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
            Financial Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginTop: '2px' }}>
            Welcome back, {user?.fullName || 'User'}! Here is your real-time wealth summary.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refetch()}
            isLoading={isRefetching}
            title="Refresh Data"
          >
            <RefreshCw size={16} />
            Refresh
          </Button>

          <Button variant="primary" size="sm" onClick={() => navigate('/transactions')}>
            <PlusCircle size={16} />
            New Transaction
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/ai-advisor')}
            style={{
              borderColor: 'var(--emerald-500)',
              color: 'var(--emerald-400)',
              background: 'rgba(16, 185, 129, 0.1)',
            }}
          >
            <Sparkles size={16} color="var(--emerald-400)" />
            AI Insights
          </Button>
        </div>
      </div>

      {isError && (
        <Alert
          type="error"
          message="Failed to load live financial summary. Please ensure the backend services are running."
          onClose={() => {}}
        />
      )}

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        <StatCard
          title="Total Net Worth"
          amount={totalBalance}
          currency={currency}
          icon={<Wallet size={22} />}
          trendLabel="All Accounts"
          trendType="neutral"
          accentColor="var(--indigo-500)"
        />

        <StatCard
          title="Monthly Income"
          amount={monthlyIncome}
          currency={currency}
          icon={<TrendingUp size={22} />}
          trendLabel="+ Cash Flow"
          trendType="positive"
          accentColor="var(--emerald-500)"
        />

        <StatCard
          title="Monthly Expenses"
          amount={monthlyExpense}
          currency={currency}
          icon={<TrendingDown size={22} />}
          trendLabel="Total Outflow"
          trendType={monthlyExpense > monthlyIncome && monthlyIncome > 0 ? 'negative' : 'neutral'}
          accentColor="var(--rose-500)"
        />

        <StatCard
          title="Net Savings"
          amount={netSavings}
          currency={currency}
          icon={<PiggyBank size={22} />}
          trendLabel={`${savingsRate.toFixed(0)}% Savings Rate`}
          trendType={netSavings >= 0 ? 'positive' : 'negative'}
          accentColor="var(--purple-500)"
        />
      </div>

      {/* Middle Grid: Category Expenses Chart & Recent Transactions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '24px',
        }}
      >
        <CategoryExpenseChart
          categories={summary?.categoryExpenses || []}
          currency={currency}
        />

        <RecentTransactionsCard
          transactions={summary?.recentTransactions || []}
          currency={currency}
          onViewAll={() => navigate('/transactions')}
        />
      </div>
    </div>
  );
};
