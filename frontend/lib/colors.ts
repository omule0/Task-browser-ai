// Color palette definitions for the application
// Uses HSL format (hue, saturation, lightness) which is compatible with Tailwind CSS and CSS variables

// Main palette - light mode
export const lightColors = {
  // Base colors
  background: '0 0% 100%', // Pure white
  foreground: '0 0% 3.9%', // Nearly black

  // Card and popover elements
  card: '0 0% 100%',
  cardForeground: '0 0% 3.9%',
  popover: '0 0% 100%',
  popoverForeground: '0 0% 3.9%',

  // Primary colors - deep blue
  primary: '220 76% 48%', // Deep blue
  primaryForeground: '0 0% 98%',

  // Secondary colors
  secondary: '210 20% 96.1%', // Light blue-gray
  secondaryForeground: '220 76% 18%',

  // Muted colors for less emphasis
  muted: '220 14% 96.1%',
  mutedForeground: '220 8% 46%',

  // Accent colors for highlights
  accent: '220 14% 96.1%',
  accentForeground: '220 76% 18%',

  // Destructive colors for warnings/errors
  destructive: '0 84.2% 60.2%', // Red
  destructiveForeground: '0 0% 98%',

  // UI element borders and input fields
  border: '220 13% 91%',
  input: '220 13% 91%',
  ring: '224 76% 48%',

  // Chart colors for data visualization
  chart1: '220 70% 50%', // Blue
  chart2: '160 60% 45%', // Teal
  chart3: '30 80% 55%',  // Orange
  chart4: '280 65% 60%', // Purple
  chart5: '340 75% 55%', // Pink

  // Sidebar specific colors
  sidebarBackground: '220 20% 97%',
  sidebarForeground: '240 5.3% 26.1%',
  sidebarPrimary: '220 76% 48%',
  sidebarPrimaryForeground: '0 0% 98%',
  sidebarAccent: '220 15% 93%',
  sidebarAccentForeground: '240 5.9% 10%',
  sidebarBorder: '220 13% 91%',
  sidebarRing: '217.2 91.2% 59.8%',
};

// Dark mode palette
export const darkColors = {
  // Base colors
  background: '220 30% 7%', // Deeper blue-gray background
  foreground: '60 10% 98%',  // Brighter white text

  // Card and popover elements
  card: '222 32% 10%',
  cardForeground: '60 10% 98%',
  popover: '222 32% 10%',
  popoverForeground: '60 10% 98%',

  // Primary colors
  primary: '217 85% 60%', // More vibrant blue
  primaryForeground: '0 0% 100%',

  // Secondary colors
  secondary: '217 25% 24%',
  secondaryForeground: '60 10% 98%',

  // Muted colors for less emphasis
  muted: '215 32% 15%',
  mutedForeground: '217 15% 70%',

  // Accent colors for highlights
  accent: '217 25% 24%',
  accentForeground: '60 10% 98%',

  // Destructive colors for warnings/errors
  destructive: '0 80% 55%', // Brighter red
  destructiveForeground: '0 0% 100%',

  // UI element borders and input fields
  border: '217 24% 22%',
  input: '217 24% 22%',
  ring: '224 85% 55%',

  // Chart colors for data visualization
  chart1: '210 100% 65%', // Bright blue
  chart2: '160 85% 50%',  // More vibrant teal
  chart3: '30 95% 65%',   // Brighter orange
  chart4: '280 85% 65%',  // Vibrant purple
  chart5: '340 90% 65%',  // Vibrant pink

  // Sidebar specific colors
  sidebarBackground: '222 50% 9%',
  sidebarForeground: '217 15% 90%',
  sidebarPrimary: '217 85% 60%',
  sidebarPrimaryForeground: '0 0% 100%',
  sidebarAccent: '223 18% 18%',
  sidebarAccentForeground: '60 10% 98%',
  sidebarBorder: '220 18% 20%',
  sidebarRing: '217 90% 65%',
};

// Helper function to convert the color object to CSS variables
export const toHslCssVariables = (colors: typeof lightColors): Record<string, string> => {
  const cssVars: Record<string, string> = {};
  
  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case with '--' prefix
    const cssVarName = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssVars[cssVarName] = value;
  });
  
  return cssVars;
}; 