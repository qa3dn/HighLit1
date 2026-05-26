import React, { createContext, useState, useContext, useEffect,type ReactNode } from 'react';

// 1. TypeScript Interfaces
export type UserRole = 'admin' | 'manager' | 'user' | 'student' | 'company';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component Props
interface AuthProviderProps {
  children: ReactNode;
}

// 2 & 3. Provider Component & Logic
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 4. Persistence - Check on start
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to parse user from local storage:', error);
        // Optionally clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User, token: string) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setUser(userData);
    } catch (error) {
      console.error('Failed to save auth data to local storage:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    } catch (error) {
      console.error('Failed to remove auth data from local storage:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. Custom Hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
