import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'chrome';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#d3d3d3] focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-40 disabled:cursor-not-allowed select-none';

    const variants = {
      primary:
        'bg-[#d3d3d3] text-[#16171B] font-semibold hover:bg-[#c4c4c4] active:scale-[0.98] border border-[#b8b8b8] shadow-sm',
      secondary:
        'bg-[#d3d3d3] text-[#16171B] font-medium hover:bg-[#c4c4c4] active:scale-[0.98] border border-[#b8b8b8] shadow-sm',
      ghost:
        'bg-transparent text-muted hover:text-ink hover:bg-surface2 active:scale-[0.98]',
      danger:
        'bg-danger text-white hover:opacity-90 active:scale-[0.98] border border-transparent shadow-sm',
      chrome:
        'bg-[#d3d3d3] text-[#16171B] font-semibold border border-[#b8b8b8] shadow-sm hover:bg-[#c4c4c4] active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2 rounded-control gap-2',
      lg: 'text-base px-6 py-2.5 rounded-control gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={twMerge(clsx(base, variants[variant], sizes[size], className))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
