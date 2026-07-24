import { apiClient } from './axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/auth/register', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/users/auth/refresh', { refreshToken });
    return response.data;
  },
};
