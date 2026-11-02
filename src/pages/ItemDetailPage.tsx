import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checklist } from '@/components/items/Checklist';
import { BudgetMeter } from '@/components/items/BudgetMeter';
import { CompleteDialog } from '@/components/items/CompleteDialog';
import { isOverdue, isDueSoon, formatLocalDate, formatDateTime } from '@/lib/dates';
import { useToast } from '@/components/ui/Toast';

export function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  const items = useAppStore((s) => s.items);
  const categories = useAppStore((s) => s.categories);
  const currency = useAppStore((s) => s.settings.currency);

  const completeItem = useAppStore((s) => s.completeItem);
  const uncompleteItem = useAppStore((s) => s.uncompleteItem);
  const deleteItem = useAppStore((s) => s.deleteItem);
  const restoreItem = useAppStore((s) => s.restoreItem);
  const toggleChecklistItem = useAppStore((s) => s.toggleChecklistItem);
  const addChecklistItem = useAppStore((s) => s.addChecklistItem);
  const deleteChecklistItem = useAppStore((s) => s.deleteChecklistItem);

  const item = items.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4">
        <h2 className="text-xl font-display font-bold text-ink">Goal Not Found</h2>
        <p className="text-sm text-muted">
          This dream might have been deleted or never existed.
        </p>
        <Button variant="secondary" onClick={() => navigate('/list')}>
          Back to List
        </Button>
      </div>
    );
  }

  const category = categories.find((c) => c.id === item.categoryId);
  const isCompleted = item.status === 'completed';
  const isItemOverdue = isOverdue(item.targetDate, item.status);
  const isItemDueSoon = isDueSoon(item.targetDate, item.status);

  const handleDelete = () => {
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
      navigate('/list');
    }
  };

  const handleToggleComplete = () => {
    if (isCompleted) {
      uncompleteItem(item.id);
      toast({
        title: 'Returned to Pending',
        description: `"${item.title}" marked as pending.`,
      });
    } else {
      setIsCompleteOpen(true);
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Top Navigation & Action Controls */}
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/list')}
            className="p-1.5 text-muted hover:text-ink rounded-lg gap-1.5 text-xs font-mono uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My List</span>
          </Button>

          <div className="flex items-center gap-2">
            <Link to={`/edit/${item.id}`}>
              <Button variant="secondary" size="sm" className="font-mono text-xs uppercase">
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Edit
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-muted hover:text-danger font-mono text-xs uppercase"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="glass-panel corner-brackets rounded-card border border-line p-6 sm:p-8 space-y-6">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/40 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                {category?.name || 'Other'}
              </span>
              <Badge variant={item.priority}>{item.priority} Priority</Badge>
              {item.horizon && <Badge variant="default">{item.horizon}</Badge>}
            </div>

            <div className="flex items-center gap-2">
              {isItemOverdue && <Badge variant="overdue">Overdue</Badge>}
              {isItemDueSoon && !isItemOverdue && <Badge variant="dueSoon">Due Soon</Badge>}
              <Badge variant={isCompleted ? 'completed' : 'default'}>
                {isCompleted ? 'Achieved' : 'Pending'}
              </Badge>
            </div>
          </div>

          {/* Title & Emoji */}
          <div className="flex items-start gap-4">
            <span className="text-4xl select-none shrink-0">{item.emoji}</span>
            <div className="space-y-2 flex-1">
              <h1
                className={`text-2xl sm:text-3xl font-display font-bold leading-tight ${
                  isCompleted ? 'line-through text-muted' : 'text-ink'
                }`}
              >
                {item.title}
              </h1>

              {item.targetDate && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Target Date: {formatLocalDate(item.targetDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="pt-2 text-sm sm:text-base text-muted leading-relaxed whitespace-pre-wrap">
              {item.description}
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <Tag className="w-3 h-3 text-muted" />
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full bg-surface2 text-muted text-xs font-mono border border-line/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Complete / Undo Primary Action Button */}
          <div className="pt-4 border-t border-line/40 flex items-center justify-between">
            <Button
              variant={isCompleted ? 'secondary' : 'chrome'}
              onClick={handleToggleComplete}
              className="font-mono text-xs uppercase tracking-wider"
            >
              {isCompleted ? (
                <>
                  <Circle className="w-4 h-4 mr-1.5" />
                  Mark as Incomplete
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-success" />
                  Mark as Achieved
                </>
              )}
            </Button>

            {isCompleted && item.completedAt && (
              <span className="text-xs font-mono text-success flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Achieved on {formatDateTime(item.completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Completion Story & Reflection Card */}
        {isCompleted && item.reflection && (
          <div className="glass-panel corner-brackets rounded-card border border-success/30 bg-success/5 p-6 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-success font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Memory & Reflection</span>
            </div>
            <p className="text-sm sm:text-base text-ink italic leading-relaxed whitespace-pre-wrap">
              "{item.reflection}"
            </p>
          </div>
        )}

        {/* Sub-tasks Checklist */}
        <div className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-4">
          <h2 className="text-base font-display font-semibold text-ink tracking-tight">
            Action Steps & Sub-Tasks
          </h2>
          <Checklist
            items={item.checklist}
            onToggle={(checkId) => toggleChecklistItem(item.id, checkId)}
            onAdd={(text) => addChecklistItem(item.id, text)}
            onDelete={(checkId) => deleteChecklistItem(item.id, checkId)}
          />
        </div>

        {/* Budget Tracker */}
        {item.budget && (
          <div className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-4">
            <h2 className="text-base font-display font-semibold text-ink tracking-tight">
              Budget & Funding Progress
            </h2>
            <BudgetMeter budget={item.budget} currency={currency} />
          </div>
        )}

        {/* Meta Timestamps */}
        <div className="text-[11px] font-mono text-muted/60 flex items-center justify-between pt-2">
          <span>Created: {formatDateTime(item.createdAt)}</span>
          <span>Last modified: {formatDateTime(item.updatedAt)}</span>
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
