import { apiClient } from './axios';
import type { User } from '../types/auth';

export interface UpdateProfileRequest {
  fullName: string;
  avatarUrl?: string;
  currency?: string;
}

export const usersApi = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>('/users/profile', data);
    return response.data;
  },
};
