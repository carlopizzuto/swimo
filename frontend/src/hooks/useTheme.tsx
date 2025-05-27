import { useEffect, createContext, useContext, ReactNode } from 'react';

type Theme = 'dark'; // Only dark theme is supported

interface ThemeContextType {
  theme: Theme;
  // toggleTheme is removed as it's dark mode only
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme: Theme = 'dark'; // Hardcode theme to dark

  useEffect(() => {
    const root = window.document.documentElement;
    // Always apply dark class and remove light from local storage if it exists
    root.classList.add('dark');
    localStorage.removeItem('swimo-theme'); // Clean up old theme setting
    // No need to setItem as it's always dark
  }, []); // Runs once on mount

  const value = {
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 