import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

export function EmptyState({ icon = '🌌', title, description, action, children }: EmptyStateProps) {
  return (
    <div className="glass-panel corner-brackets rounded-card border border-line p-8 md:p-12 text-center max-w-md mx-auto my-6 space-y-4">
      <div className="text-4xl select-none mb-2 filter drop-shadow-sm">{icon}</div>
      <h3 className="text-lg font-display font-semibold text-ink tracking-tight">{title}</h3>
      <p className="text-sm text-muted leading-relaxed max-w-sm mx-auto">{description}</p>
      {action && (
        <div className="pt-2">
          <Button variant="chrome" onClick={action.onClick} className="font-mono text-xs uppercase tracking-wider">
            {action.label}
          </Button>
        </div>
      )}
      {children}
    </div>
  );
}
