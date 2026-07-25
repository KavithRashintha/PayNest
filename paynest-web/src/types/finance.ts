export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type AccountType = 'BANK' | 'CASH' | 'CREDIT_CARD' | 'INVESTMENT' | 'SAVINGS' | 'OTHER';

export type CategoryType = 'INCOME' | 'EXPENSE';

export type BudgetPeriod = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface AccountResponse {
  id: number;
  userId: number;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountRequest {
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
}

export interface CategoryResponse {
  id: number;
  userId?: number;
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
  isSystemDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

export interface BudgetResponse {
  id: number;
  userId: number;
  categoryId: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  amountLimit: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetRequest {
  categoryId: number;
  amountLimit: number;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
}

export interface BudgetStatusResponse {
  budget: BudgetResponse;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: double;
  isExceeded: boolean;
}

type double = number;

export interface CategorySpendSummary {
  categoryId: number;
  categoryName: string;
  icon?: string;
  color?: string;
  totalSpent: number;
  percentageOfTotal: number;
}

export interface TransactionRequest {
  accountId: number;
  categoryId?: number;
  toAccountId?: number;
  amount: number;
  type: TransactionType;
  title: string;
  description?: string;
  transactionDate?: string;
}

export interface TransactionResponse {
  id: number;
  userId: number;
  accountId: number;
  accountName?: string;
  categoryId?: number;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  toAccountId?: number;
  toAccountName?: string;
  amount: number;
  type: TransactionType;
  title: string;
  description?: string;
  transactionDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  categoryExpenses: CategorySpendSummary[];
  recentTransactions: TransactionResponse[];
}
