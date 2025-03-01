import { useEffect, useState } from 'react';
import { lightColors, darkColors } from '../lib/colors';

type ColorKey = keyof typeof lightColors;

/**
 * Hook to access theme colors based on current color mode
 * 
 * @returns Object with color utility functions
 */
export function useThemeColors() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode on initial load and when it changes
  useEffect(() => {
    // Check initial dark mode
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Set up observer for changes to the classList
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === 'class' &&
          mutation.target === document.documentElement
        ) {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, { attributes: true });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  /**
   * Get a color value from the current theme
   * @param key - The color key to get
   * @returns HSL color value as a string
   */
  const getColor = (key: ColorKey): string => {
    return isDarkMode ? darkColors[key] : lightColors[key];
  };

  /**
   * Get a color value formatted as a CSS HSL string
   * @param key - The color key to get
   * @returns CSS HSL color value (e.g., 'hsl(220, 76%, 48%)')
   */
  const getHslColor = (key: ColorKey): string => {
    const color = getColor(key);
    const [h, s, l] = color.split(' ');
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  /**
   * Get a color with adjusted opacity
   * @param key - The color key to get
   * @param opacity - Opacity value (0-1)
   * @returns CSS HSLA color value with opacity
   */
  const getColorWithOpacity = (key: ColorKey, opacity: number): string => {
    const color = getColor(key);
    const [h, s, l] = color.split(' ');
    return `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
  };

  /**
   * Get CSS variable name for a color
   * @param key - The color key
   * @returns CSS variable name
   */
  const getCssVar = (key: ColorKey): string => {
    // Convert camelCase to kebab-case with '--' prefix
    return '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
  };

  return {
    isDarkMode,
    getColor,
    getHslColor,
    getColorWithOpacity,
    getCssVar,
    colors: isDarkMode ? darkColors : lightColors,
  };
} 