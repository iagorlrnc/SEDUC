import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: number;
  username: string;
  nome: string;
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, id: number, username: string, nome: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('seduc_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as User;
        setUser(parsed);
        // Configura token global no Axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      } catch (e) {
        localStorage.removeItem('seduc_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, id: number, username: string, nome: string, role: string) => {
    const newUser: User = {
      id,
      username,
      nome,
      role: role as User['role'],
      token,
    };
    setUser(newUser);
    localStorage.setItem('seduc_user', JSON.stringify(newUser));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('seduc_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
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
