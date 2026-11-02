import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Circle, Edit3, Trash2, ListChecks } from 'lucide-react';
import { Item, Category } from '@/lib/schema';
import { Badge } from '@/components/ui/Badge';
import { isOverdue, isDueSoon, formatLocalDate } from '@/lib/dates';
import { CompleteDialog } from './CompleteDialog';
import { useToast } from '@/components/ui/Toast';
import { useAppStore } from '@/store/useAppStore';

export interface ItemRowProps {
  item: Item;
  category?: Category;
}

export function ItemRow({ item, category }: ItemRowProps) {
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
      <div className="glass-panel corner-brackets rounded-control border border-line hover:border-control/80 p-3.5 transition-all duration-150 flex items-center justify-between gap-3 group">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            onClick={handleToggleStatus}
            className={`p-1 rounded transition-colors shrink-0 ${
              isCompleted
                ? 'text-success hover:text-success/80'
                : 'text-muted hover:text-ink'
            }`}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 fill-success/10" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <span className="text-xl select-none shrink-0">{item.emoji}</span>

          <div className="min-w-0 flex-1">
            <Link
              to={`/item/${item.id}`}
              className={`block font-display font-medium text-sm truncate hover:underline ${
                isCompleted ? 'line-through text-muted' : 'text-ink'
              }`}
            >
              {item.title}
            </Link>
            <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-muted truncate">
              <span>{category?.name || 'Other'}</span>
              {item.targetDate && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatLocalDate(item.targetDate)}
                  </span>
                </>
              )}
              {totalChecklistCount > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <ListChecks className="w-3 h-3" />
                    {completedChecklistCount}/{totalChecklistCount}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Badges & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isItemOverdue && <Badge variant="overdue">Overdue</Badge>}
          {isItemDueSoon && !isItemOverdue && <Badge variant="dueSoon">Due Soon</Badge>}
          <Badge variant={item.priority}>{item.priority}</Badge>

          <div className="flex items-center gap-1 ml-1 opacity-80 group-hover:opacity-100">
            <Link
              to={`/edit/${item.id}`}
              className="p-1.5 rounded text-muted hover:text-ink hover:bg-surface2 transition-colors"
              aria-label="Edit goal"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleDelete}
              className="p-1.5 rounded text-muted hover:text-danger hover:bg-surface2 transition-colors"
              aria-label="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
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
