import { Link } from 'react-router-dom';
import { Shield, Download, Settings } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-line/60 bg-surface/50 mt-16 py-8 px-4 text-xs font-mono text-muted relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>Local storage only. Your data never leaves this browser.</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/settings"
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </Link>
          <span className="text-line">•</span>
          <Link
            to="/settings"
            className="hover:text-ink transition-colors flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
