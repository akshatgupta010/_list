import { Budget } from '@/lib/schema';
import { formatMoney } from '@/lib/money';
import { ProgressBar } from '@/components/ui/ProgressBar';

export interface BudgetMeterProps {
  budget: Budget;
  currency?: string;
}

export function BudgetMeter({ budget, currency = 'INR' }: BudgetMeterProps) {
  if (!budget || budget.estimated <= 0) return null;

  const { estimated, saved } = budget;
  const percentage = Math.round((saved / estimated) * 100);
  const remaining = Math.max(0, estimated - saved);
  const isOverfunded = saved > estimated;

  return (
    <div className="p-3.5 rounded-card bg-surface2/50 border border-line/60 space-y-2.5">
      <div className="flex justify-between items-baseline text-xs font-mono">
        <span className="text-muted uppercase tracking-wider">Budget Tracking</span>
        <span className="text-ink font-semibold">
          {formatMoney(saved, currency)} / {formatMoney(estimated, currency)}
        </span>
      </div>

      <ProgressBar
        value={saved}
        max={estimated}
        showPercentage={false}
        size="sm"
      />

      <div className="flex justify-between items-center text-[11px] font-mono text-muted">
        <span>
          {isOverfunded ? (
            <span className="text-success font-medium">Overfunded (+{formatMoney(saved - estimated, currency)})</span>
          ) : remaining > 0 ? (
            <span>Remaining: {formatMoney(remaining, currency)}</span>
          ) : (
            <span className="text-success font-medium">100% Funded</span>
          )}
        </span>
        <span className="font-semibold text-ink">{percentage}% saved</span>
      </div>
    </div>
  );
}
