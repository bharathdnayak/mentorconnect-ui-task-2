import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@mentorconnect/shared';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  department?: { id: string; code: string; name: string } | null;
  profileCompleted?: boolean;
  studentProfileId?: string;
  mentorProfileId?: string;
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserSession) => void;
  logout: () => void;
  updateUser: (updates: Partial<UserSession>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('mentorconnect_token');
      const storedUser = localStorage.getItem('mentorconnect_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
      localStorage.removeItem('mentorconnect_token');
      localStorage.removeItem('mentorconnect_user');
    } finally {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = (newToken: string, newUser: UserSession) => {
    localStorage.setItem('mentorconnect_token', newToken);
    localStorage.setItem('mentorconnect_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('mentorconnect_token');
    localStorage.removeItem('mentorconnect_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<UserSession>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    localStorage.setItem('mentorconnect_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
