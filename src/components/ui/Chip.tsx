import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  onRemove?: () => void;
}

export function Chip({ active, onRemove, className, children, ...props }: ChipProps) {
  const base =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all duration-150 border select-none focus:outline-none focus:ring-1 focus:ring-ink';

  const style = active
    ? 'bg-ink text-bg border-ink shadow-sm'
    : 'bg-surface text-muted border-line hover:border-control hover:text-ink';

  return (
    <button className={twMerge(clsx(base, style, className))} {...props}>
      <span>{children}</span>
      {onRemove && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 p-0.5 rounded-full"
          aria-label="Remove"
        >
          <X className="w-3 h-3" />
        </span>
      )}
    </button>
  );
}
