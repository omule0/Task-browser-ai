import { useTheme } from './ThemeProvider';
import { SunIcon, MoonIcon, MonitorIcon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

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
      className={`p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
      aria-label={`Change theme, current theme: ${theme}`}
      title={`Current theme: ${theme}`}
      tabIndex={0}
    >
      {theme === 'light' && <SunIcon className="h-5 w-5" />}
      {theme === 'dark' && <MoonIcon className="h-5 w-5" />}
      {theme === 'system' && <MonitorIcon className="h-5 w-5" />}
    </button>
  );
}

export function ThemeToggleWithLabel({ className = '' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <label htmlFor="theme-select" className="text-sm font-medium">
        Theme:
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
        className="rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Select theme"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
} 