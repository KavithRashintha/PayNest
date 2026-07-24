import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load stored authentication state on mount
    const savedToken = localStorage.getItem('paynest_access_token');
    const savedUser = localStorage.getItem('paynest_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user credentials', e);
        localStorage.removeItem('paynest_access_token');
        localStorage.removeItem('paynest_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem('paynest_access_token', data.accessToken);
    localStorage.setItem('paynest_refresh_token', data.refreshToken);
    localStorage.setItem('paynest_user', JSON.stringify(data.user));
  };

  const login = async (credentials: LoginRequest) => {
    const data = await authApi.login(credentials);
    handleAuthSuccess(data);
  };

  const register = async (reqData: RegisterRequest) => {
    const data = await authApi.register(reqData);
    handleAuthSuccess(data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('paynest_access_token');
    localStorage.removeItem('paynest_refresh_token');
    localStorage.removeItem('paynest_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
