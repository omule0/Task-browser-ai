'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { lightColors, darkColors, toHslCssVariables } from '../lib/colors';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  transitionDuration?: number;
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  transitionDuration = 200, // Default transition duration in ms
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Update the theme
  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;
    
    const root = window.document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const resolvedThemeValue = newTheme === 'system' ? systemTheme : newTheme;
    
    // Add transition before changing theme
    root.style.transition = `background-color ${transitionDuration}ms ease-in-out, border-color ${transitionDuration}ms ease-in-out, color ${transitionDuration}ms ease-in-out`;
    
    // Remove class
    root.classList.remove('light', 'dark');
    
    // Add the correct class based on the resolved theme
    root.classList.add(resolvedThemeValue);
    
    // Update states
    setIsDarkMode(resolvedThemeValue === 'dark');
    setResolvedTheme(resolvedThemeValue as 'light' | 'dark');
    
    // Apply CSS variables
    const colors = resolvedThemeValue === 'dark' ? darkColors : lightColors;
    const cssVars = toHslCssVariables(colors);
    
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Remove transition after a delay to prevent transitions when not theme switching
    setTimeout(() => {
      root.style.transition = '';
    }, transitionDuration);
  }, [transitionDuration]);

  // Handle theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, transitionDuration, applyTheme]);

  // Initial theme setup and hydration fix
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || defaultTheme;
    setTheme(initialTheme);
    setMounted(true);
  }, [defaultTheme]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Prevent hydration mismatch by rendering a blank div until mounted
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 