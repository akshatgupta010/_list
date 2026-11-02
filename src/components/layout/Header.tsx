import { NavLink, Link } from 'react-router-dom';
import { Plus, Sun, Moon, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';

export function Header() {
  const theme = useAppStore((s) => s.settings.theme);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/list', label: 'My List' },
    { to: '/completed', label: 'Completed' },
    { to: '/explore', label: 'Inspiration' },
    { to: '/stats', label: 'Stats' },
    { to: '/categories', label: 'Categories' },
    { to: '/settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-line/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-ink font-display font-bold text-xl tracking-tighter select-none"
          >
            <div className="w-7 h-7 rounded-lg bg-chrome-gradient border border-line flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-ink" />
            </div>
            <span>HORIZON</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-control transition-colors duration-150 uppercase tracking-wider ${
                    isActive
                      ? 'text-ink font-semibold bg-surface2 border border-line'
                      : 'text-muted hover:text-ink hover:bg-surface2/60'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-control text-muted hover:text-ink"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-warning" />
            ) : (
              <Moon className="w-4 h-4 text-ink" />
            )}
          </Button>

          <Link to="/add">
            <Button variant="chrome" size="sm" className="font-mono text-xs uppercase tracking-wider">
              <Plus className="w-4 h-4 mr-1" />
              Add Dream
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
