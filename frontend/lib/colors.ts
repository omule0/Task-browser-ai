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
  background: '220 26% 9%', // Deep blue-gray
  foreground: '60 5% 96%',  // Off-white

  // Card and popover elements
  card: '220 26% 9%',
  cardForeground: '60 5% 96%',
  popover: '220 26% 9%',
  popoverForeground: '60 5% 96%',

  // Primary colors
  primary: '217 76% 56%', // Bright blue
  primaryForeground: '0 0% 100%',

  // Secondary colors
  secondary: '217 19% 27%',
  secondaryForeground: '60 5% 96%',

  // Muted colors for less emphasis
  muted: '215 27% 17%',
  mutedForeground: '217 10% 64%',

  // Accent colors for highlights
  accent: '217 19% 27%',
  accentForeground: '60 5% 96%',

  // Destructive colors for warnings/errors
  destructive: '0 72% 51%', // Darker red
  destructiveForeground: '0 0% 98%',

  // UI element borders and input fields
  border: '217 19% 27%',
  input: '217 19% 27%',
  ring: '224 76% 48%',

  // Chart colors for data visualization
  chart1: '210 100% 65%', // Bright blue
  chart2: '160 60% 45%',  // Teal
  chart3: '30 90% 65%',   // Bright orange
  chart4: '280 75% 65%',  // Vibrant purple
  chart5: '340 80% 65%',  // Vibrant pink

  // Sidebar specific colors
  sidebarBackground: '222 47% 11%',
  sidebarForeground: '217 10% 88%',
  sidebarPrimary: '217 76% 56%',
  sidebarPrimaryForeground: '0 0% 100%',
  sidebarAccent: '223 14% 20%',
  sidebarAccentForeground: '60 5% 96%',
  sidebarBorder: '220 13% 23%',
  sidebarRing: '217.2 91.2% 59.8%',
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