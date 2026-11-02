import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Circle, Edit3, Trash2, ListChecks, DollarSign } from 'lucide-react';
import { Item, Category } from '@/lib/schema';
import { Badge } from '@/components/ui/Badge';
import { isOverdue, isDueSoon, formatLocalDate } from '@/lib/dates';
import { CompleteDialog } from './CompleteDialog';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';

export interface ItemCardProps {
  item: Item;
  category?: Category;
}

export function ItemCard({ item, category }: ItemCardProps) {
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const { toast } = useToast();
  const deleteItem = useAppStore((s) => s.deleteItem);
  const restoreItem = useAppStore((s) => s.restoreItem);
  const completeItem = useAppStore((s) => s.completeItem);
  const uncompleteItem = useAppStore((s) => s.uncompleteItem);

  const isItemOverdue = isOverdue(item.targetDate, item.status);
  const isItemDueSoon = isDueSoon(item.targetDate, item.status);
  const isCompleted = item.status === 'completed';

  const completedChecklistCount = item.checklist.filter((c) => c.done).length;
  const totalChecklistCount = item.checklist.length;

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompleted) {
      uncompleteItem(item.id);
      toast({
        title: 'Returned to Pending',
        description: `"${item.title}" is active again.`,
      });
    } else {
      setIsCompleteOpen(true);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const removed = deleteItem(item.id);
    if (removed) {
      toast({
        title: 'Goal Deleted',
        description: `"${item.title}" removed.`,
        action: {
          label: 'Undo',
          onClick: () => restoreItem(removed),
        },
        durationMs: 6000,
      });
    }
  };

  return (
    <>
      <div className="glass-panel corner-brackets rounded-card border border-line hover:border-control/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg flex flex-col justify-between group">
        <div>
          {/* Header Row: Category, Priority, and Horizon */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-mono text-muted uppercase tracking-wider truncate">
              {category ? category.name : 'Other'}
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              {item.horizon && (
                <Badge variant="default" className="text-[10px]">
                  {item.horizon}
                </Badge>
              )}
              <Badge variant={item.priority}>{item.priority}</Badge>
            </div>
          </div>

          {/* Title & Emoji */}
          <Link to={`/item/${item.id}`} className="block group-hover:text-ink">
            <div className="flex items-start gap-3">
              <span className="text-2xl select-none shrink-0 mt-0.5">{item.emoji}</span>
              <div className="min-w-0">
                <h3
                  className={`font-display font-semibold text-base leading-snug line-clamp-2 ${
                    isCompleted ? 'line-through text-muted' : 'text-ink'
                  }`}
                >
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-muted line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Meta & Controls */}
        <div className="mt-4 pt-3.5 border-t border-line/40 flex items-center justify-between gap-2 text-xs">
          {/* Status Badges & Dates */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.targetDate && (
              <div className="flex items-center gap-1 font-mono text-[11px] text-muted">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatLocalDate(item.targetDate)}</span>
              </div>
            )}

            {isItemOverdue && <Badge variant="overdue">Overdue</Badge>}
            {isItemDueSoon && !isItemOverdue && <Badge variant="dueSoon">Due Soon</Badge>}

            {totalChecklistCount > 0 && (
              <span className="flex items-center gap-1 font-mono text-[11px] text-muted">
                <ListChecks className="w-3.5 h-3.5" />
                <span>
                  {completedChecklistCount}/{totalChecklistCount}
                </span>
              </span>
            )}

            {item.budget && (
              <span className="flex items-center gap-0.5 font-mono text-[11px] text-muted">
                <DollarSign className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              to={`/edit/${item.id}`}
              className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface2 transition-colors"
              aria-label="Edit goal"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-surface2 transition-colors"
              aria-label="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleToggleStatus}
              className={`p-1.5 rounded-lg transition-colors ${
                isCompleted
                  ? 'text-success hover:text-success/80'
                  : 'text-muted hover:text-ink hover:bg-surface2'
              }`}
              aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 fill-success/10" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <CompleteDialog
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        goalTitle={item.title}
        onConfirm={(res) => completeItem(item.id, res)}
      />
    </>
  );
}
