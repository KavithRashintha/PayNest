import { apiClient } from './axios';
import type { TransactionRequest, TransactionResponse } from '../types/finance';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const transactionsApi = {
  getTransactions: async (page = 0, size = 20): Promise<PageResponse<TransactionResponse>> => {
    const response = await apiClient.get<PageResponse<TransactionResponse>>('/finance/transactions', {
      params: { page, size },
    });
    return response.data;
  },

  getTransactionById: async (id: number): Promise<TransactionResponse> => {
    const response = await apiClient.get<TransactionResponse>(`/finance/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data: TransactionRequest): Promise<TransactionResponse> => {
    const response = await apiClient.post<TransactionResponse>('/finance/transactions', data);
    return response.data;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await apiClient.delete(`/finance/transactions/${id}`);
  },
};
