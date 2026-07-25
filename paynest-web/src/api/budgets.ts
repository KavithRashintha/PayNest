import { apiClient } from './axios';
import type { BudgetRequest, BudgetResponse, BudgetStatusResponse } from '../types/finance';

export const budgetsApi = {
  getBudgets: async (): Promise<BudgetResponse[]> => {
    const response = await apiClient.get<BudgetResponse[]>('/finance/budgets');
    return response.data;
  },

  getBudgetsStatus: async (): Promise<BudgetStatusResponse[]> => {
    const response = await apiClient.get<BudgetStatusResponse[]>('/finance/budgets/status');
    return response.data;
  },

  createBudget: async (data: BudgetRequest): Promise<BudgetResponse> => {
    const response = await apiClient.post<BudgetResponse>('/finance/budgets', data);
    return response.data;
  },

  deleteBudget: async (id: number): Promise<void> => {
    await apiClient.delete(`/finance/budgets/${id}`);
  },
};
