import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User;
  token: string;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const DEFAULT_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'demo@pixelforge.ai',
  fullName: 'PixelForge User',
  role: 'ROLE_USER'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>(DEFAULT_USER);
  const [token] = useState<string>('demo-token');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: () => {},
        logout: () => {},
        isAuthenticated: true,
        isLoading: false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
