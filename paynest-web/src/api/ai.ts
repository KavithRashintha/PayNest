import { apiClient } from './axios';

export interface CategorizeRequest {
  title: string;
  amount?: number;
}

export interface CategorizeResponse {
  suggestedCategory: string;
  confidence?: number;
  explanation?: string;
}

export const aiApi = {
  categorize: async (data: CategorizeRequest): Promise<CategorizeResponse> => {
    const response = await apiClient.post<CategorizeResponse>('/ai/categorize', data);
    return response.data;
  },
};
