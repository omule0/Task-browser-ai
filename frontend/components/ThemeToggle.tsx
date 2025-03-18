import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'dropdown' | 'switch';
}

export function ThemeToggle({ 
  className = '',
  variant = 'icon'
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`h-9 w-9 ${className}`} />;
  }
  
  if (variant === 'dropdown') {
    return <ThemeToggleWithLabel className={className} />;
  }
  
  if (variant === 'switch') {
    return <ThemeToggleSwitch className={className} />;
  }

  const handleToggle = () => {
    switch (theme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('system');
        break;
      case 'system':
        setTheme('light');
        break;
      default:
        setTheme('light');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`relative flex h-9 w-9 items-center justify-center rounded-md 
        bg-background hover:bg-accent focus:outline-none focus:ring-2 
        focus:ring-ring focus:ring-offset-2 ${className}`}
      aria-label={`Change theme, current theme: ${theme}`}
      title={`Current theme: ${theme}`}
      tabIndex={0}
    >
      {theme === 'light' && (
        <SunIcon className="h-5 w-5 text-amber-500 transition-transform duration-300 hover:rotate-45" />
      )}
      {theme === 'dark' && (
        <MoonIcon className="h-5 w-5 text-indigo-400 transition-transform duration-300 hover:rotate-12" />
      )}
      {theme === 'system' && (
        <MonitorIcon className="h-5 w-5 text-foreground transition-transform duration-300 hover:scale-110" />
      )}
      <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary transition-all duration-300" />
    </button>
  );
}

export function ThemeToggleWithLabel({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <label htmlFor="theme-select" className="text-sm font-medium text-foreground">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm 
        shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}

export function ThemeToggleSwitch({ className = '' }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  
  const handleClick = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="switch"
      aria-checked={resolvedTheme === 'dark'}
      aria-label={`Toggle ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      className={`relative inline-flex h-6 w-11 items-center rounded-full 
        border border-transparent bg-input transition-colors focus:outline-none 
        focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      tabIndex={0}
    >
      <span
        className={`${
          resolvedTheme === 'dark' ? 'translate-x-6 bg-primary' : 'translate-x-1 bg-background'
        } flex h-4 w-4 transform items-center justify-center rounded-full shadow-sm 
        transition-transform duration-200 ease-in-out`}
      >
        {resolvedTheme === 'dark' ? (
          <MoonIcon className="h-3 w-3 text-primary-foreground" />
        ) : (
          <SunIcon className="h-3 w-3 text-amber-500" />
        )}
      </span>
    </button>
  );
} 