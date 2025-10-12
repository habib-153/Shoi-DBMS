import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  user_id?: number;
  therapist_id?: number;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'therapist';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('userRole');
      
      if (storedUser && storedRole) {
        try {
          const userData = JSON.parse(storedUser);
          setUser({ ...userData, role: storedRole });
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);
      window.dispatchEvent(new Event('userLoggedIn'));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      window.dispatchEvent(new Event('userLoggedOut'));
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function RequireAuth({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p>You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}