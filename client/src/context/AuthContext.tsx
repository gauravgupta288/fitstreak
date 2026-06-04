import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string;
  xp: number;
  level: number;
  height?: number;
  weight?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    const token = localStorage.getItem('fitstreak_token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const profile = await apiRequest('/api/auth/me');
      setUser(profile);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      // If token is invalid or expired, clear it
      localStorage.removeItem('fitstreak_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('fitstreak_token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        lastWorkoutDate: data.lastWorkoutDate,
        xp: data.xp,
        level: data.level,
      });
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      localStorage.setItem('fitstreak_token', data.token);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        currentStreak: data.currentStreak,
        longestStreak: data.longestStreak,
        lastWorkoutDate: data.lastWorkoutDate,
        xp: data.xp,
        level: data.level,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('fitstreak_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const profile = await apiRequest('/api/auth/me');
      setUser(profile);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
