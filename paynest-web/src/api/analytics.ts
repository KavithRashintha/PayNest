import { apiClient } from './axios';
import type { FinancialSummary } from '../types/finance';

export const analyticsApi = {
  /**
   * Fetches the comprehensive financial summary for the current authenticated user.
   * Includes total balance, monthly income/expense, net savings, spending per category,
   * and recent transaction history.
   * 
   * Endpoint: GET /api/finance/analytics/summary
   */
  getFinancialSummary: async (): Promise<FinancialSummary> => {
    const response = await apiClient.get<FinancialSummary>('/finance/analytics/summary');
    return response.data;
  },
};
