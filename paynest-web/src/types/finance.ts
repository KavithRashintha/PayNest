export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface CategorySpendSummary {
  categoryId: number;
  categoryName: string;
  icon?: string;
  color?: string;
  totalSpent: number;
  percentageOfTotal: number;
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
