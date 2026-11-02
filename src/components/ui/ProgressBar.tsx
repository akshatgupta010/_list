import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={twMerge('w-full space-y-1.5', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-mono">
          {label && <span className="text-muted uppercase tracking-wider">{label}</span>}
          {showPercentage && <span className="text-ink font-semibold">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={clsx(
          'w-full bg-surface2 border border-line rounded-full overflow-hidden p-[1px]',
          sizeClasses[size]
        )}
      >
        <div
          className="h-full rounded-full bg-chrome-gradient transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
