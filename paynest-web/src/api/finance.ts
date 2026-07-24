import { apiClient } from './axios';
import type { FinancialSummary } from '../types/finance';

export const financeApi = {
  getSummary: async (): Promise<FinancialSummary> => {
    const response = await apiClient.get<FinancialSummary>('/finance/analytics/summary');
    return response.data;
  },
};
