import { createContext, useContext, useEffect, useState } from 'react';
import { lightColors, darkColors, toHslCssVariables } from '../lib/colors';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Update the theme
  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const resolvedTheme = newTheme === 'system' ? systemTheme : newTheme;
    
    // Remove class
    root.classList.remove('light', 'dark');
    
    // Add the correct class based on the resolved theme
    root.classList.add(resolvedTheme);
    
    // Update state
    setIsDarkMode(resolvedTheme === 'dark');
    
    // Apply CSS variables
    const colors = resolvedTheme === 'dark' ? darkColors : lightColors;
    const cssVars = toHslCssVariables(colors);
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  };

  // Handle theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Initial theme setup
  useEffect(() => {
    // Get saved theme from localStorage or use default
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || defaultTheme;
    setTheme(initialTheme);
  }, []);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    // Initial check
    if (theme === 'system') {
      handleChange();
    }
    
    // Add listener for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [theme]);

  // Save theme preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme,
    isDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}; 