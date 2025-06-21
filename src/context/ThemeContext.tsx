import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize with light mode, but check localStorage safely
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme from localStorage after component mounts
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        setIsDarkMode(true);
      }
    } catch (error) {
      console.log('LocalStorage not available:', error);
    }
  }, []);  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newTheme = !prev;
      try {
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      } catch (error) {
        console.log('LocalStorage not available:', error);
      }
      return newTheme;
    });
  };

  // Apply theme to document body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const value: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    theme: isDarkMode ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
