import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'high' | 'medium' | 'low' | 'completed' | 'overdue' | 'dueSoon';
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const base =
    'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider font-medium border';

  const variants = {
    default: 'bg-surface2 text-ink border-line',
    high: 'bg-danger/10 text-danger border-danger/30',
    medium: 'bg-warning/10 text-warning border-warning/30',
    low: 'bg-surface2 text-muted border-line',
    completed: 'bg-success/10 text-success border-success/30',
    overdue: 'bg-danger text-white border-danger font-semibold',
    dueSoon: 'bg-warning/15 text-warning border-warning/40 font-semibold',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], className))} {...props}>
      {children}
    </span>
  );
}
