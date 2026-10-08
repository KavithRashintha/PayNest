import { apiClient } from './axios';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actionsTaken?: string[];
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  actionsTaken?: string[];
}

export interface CategorizeRequest {
  title: string;
  description?: string;
  amount?: number;
}

export interface CategorizeResponse {
  suggestedCategory: string;
  categoryType?: string;
  confidence?: number;
}

export interface InsightsResponse {
  overallHealth: 'HEALTHY' | 'BALANCED' | 'NEEDS_ATTENTION';
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netSavings: number;
  insights: string[];
  savingsTips: string[];
  warnings: string[];
}

export const aiApi = {
  chat: async (message: string, history?: ChatMessage[]): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>('/ai/chat', { message, history });
    return response.data;
  },

  getInsights: async (): Promise<InsightsResponse> => {
    const response = await apiClient.get<InsightsResponse>('/ai/insights');
    return response.data;
  },

  categorize: async (data: CategorizeRequest): Promise<CategorizeResponse> => {
    const response = await apiClient.post<CategorizeResponse>('/ai/categorize', data);
    return response.data;
  },
};
