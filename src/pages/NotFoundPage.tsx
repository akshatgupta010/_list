import { Link } from 'react-router-dom';
import { Compass, Home, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="py-20 px-4 max-w-lg mx-auto text-center space-y-6 animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-full bg-chrome-gradient border border-line flex items-center justify-center mx-auto text-2xl shadow-lg select-none">
        <AlertOctagon className="w-8 h-8 text-ink" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-muted">
          // ERROR 404
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink tracking-tight glitch-hover select-none">
          Signal Lost in Orbit
        </h1>
        <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
          The coordinate you navigated to does not exist or has dissolved into the event horizon.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link to="/">
          <Button variant="chrome" size="md" className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider">
            <Home className="w-4 h-4 mr-1.5" />
            Home Dashboard
          </Button>
        </Link>
        <Link to="/list">
          <Button variant="secondary" size="md" className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 mr-1.5" />
            My Bucket List
          </Button>
        </Link>
      </div>
    </div>
  );
}
