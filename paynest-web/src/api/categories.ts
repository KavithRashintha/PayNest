import { apiClient } from './axios';
import type { CategoryRequest, CategoryResponse, CategoryType } from '../types/finance';

export const categoriesApi = {
  getCategories: async (type?: CategoryType): Promise<CategoryResponse[]> => {
    const params = type ? { type } : {};
    const response = await apiClient.get<CategoryResponse[]>('/finance/categories', { params });
    return response.data;
  },

  createCategory: async (data: CategoryRequest): Promise<CategoryResponse> => {
    const response = await apiClient.post<CategoryResponse>('/finance/categories', data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/finance/categories/${id}`);
  },
};
