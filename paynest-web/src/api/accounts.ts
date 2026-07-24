import { apiClient } from './axios';
import type { AccountRequest, AccountResponse } from '../types/finance';

export const accountsApi = {
  getAccounts: async (): Promise<AccountResponse[]> => {
    const response = await apiClient.get<AccountResponse[]>('/finance/accounts');
    return response.data;
  },

  getAccountById: async (id: number): Promise<AccountResponse> => {
    const response = await apiClient.get<AccountResponse>(`/finance/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data: AccountRequest): Promise<AccountResponse> => {
    const response = await apiClient.post<AccountResponse>('/finance/accounts', data);
    return response.data;
  },

  updateAccount: async (id: number, data: AccountRequest): Promise<AccountResponse> => {
    const response = await apiClient.put<AccountResponse>(`/finance/accounts/${id}`, data);
    return response.data;
  },

  deleteAccount: async (id: number): Promise<void> => {
    await apiClient.delete(`/finance/accounts/${id}`);
  },
};
