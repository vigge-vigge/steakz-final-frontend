import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  language: string;
  currency: string;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLanguage: (lang: string) => void;
  setCurrency: (curr: string) => void;
  hasPermission: (requiredRoles: Role[]) => boolean;
  hasBranchAccess: (branchId: number) => boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  language: 'en',
  currency: 'USD',
  login: () => {},
  logout: () => {},
  setLanguage: () => {},
  setCurrency: () => {},
  hasPermission: () => false,
  hasBranchAccess: () => false,
});

const LOCAL_CART_KEY = 'cart_items';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [language, setLanguageState] = useState<string>('en');
  const [currency, setCurrencyState] = useState<string>('USD');

  useEffect(() => {
    // Check for existing token and user on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedLanguage = localStorage.getItem('language');
    const storedCurrency = localStorage.getItem('currency');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    if (storedLanguage) {
      setLanguageState(storedLanguage);
    }
    if (storedCurrency) {
      setCurrencyState(storedCurrency);
    }
  }, []);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // --- Cart sync logic for customers ---
    if (newUser.role === 'CUSTOMER') {
      try {
        const raw = localStorage.getItem(LOCAL_CART_KEY);
        const cart = raw ? JSON.parse(raw) : [];
        if (Array.isArray(cart) && cart.length > 0) {
          // Send cart to backend (implement /api/cart endpoint on backend)
          await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`,
            },
            body: JSON.stringify({ items: cart }),
          });
          // Do NOT remove localStorage cart here; keep it for persistence
        }
        // Always fetch cart from backend after login
        const res = await fetch('/api/cart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(data.items));
          }
        }
      } catch (err) {
        // Ignore cart sync errors
      }
    }
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Do NOT remove cart, language, or currency from localStorage here; keep them for persistence
  };

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setCurrency = (curr: string) => {
    setCurrencyState(curr);
    localStorage.setItem('currency', curr);
  };

  // Check if user has one of the required roles
  const hasPermission = (requiredRoles: Role[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  // Check if user has access to a specific branch
  const hasBranchAccess = (branchId: number): boolean => {
    if (!user) return false;

    // Admin and General Manager have access to all branches
    if (user.role === 'ADMIN' || user.role === 'GENERAL_MANAGER') {
      return true;
    }

    // Other staff members can only access their assigned branch
    return user.branchId === branchId;
  };
  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      language,
      currency,
      login, 
      logout,
      setLanguage,
      setCurrency,
      hasPermission,
      hasBranchAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};
