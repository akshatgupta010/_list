import React, { useState } from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { ChecklistItem } from '@/lib/schema';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';

export interface ChecklistProps {
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onAdd: (text: string) => void;
  onDelete: (id: string) => void;
  readonly?: boolean;
}

export function Checklist({ items, onToggle, onAdd, onDelete, readonly = false }: ChecklistProps) {
  const [newText, setNewText] = useState('');

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    onAdd(newText.trim());
    setNewText('');
  };

  return (
    <div className="space-y-3">
      {totalCount > 0 && (
        <div className="mb-2">
          <ProgressBar
            value={completedCount}
            max={totalCount}
            label={`Checklist (${completedCount}/${totalCount} completed)`}
            size="sm"
          />
        </div>
      )}

      {/* List items */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface2/60 hover:bg-surface2 transition-colors border border-line/40 text-sm group"
          >
            <button
              type="button"
              disabled={readonly}
              onClick={() => onToggle(item.id)}
              className="flex items-center gap-2.5 flex-1 text-left min-w-0 select-none focus:outline-none"
            >
              {item.done ? (
                <CheckSquare className="w-4 h-4 text-success shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-muted group-hover:text-ink shrink-0" />
              )}
              <span
                className={`truncate ${
                  item.done ? 'line-through text-muted' : 'text-ink'
                }`}
              >
                {item.text}
              </span>
            </button>

            {!readonly && (
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 text-muted hover:text-danger p-1 transition-opacity"
                aria-label={`Delete task ${item.text}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new subtask */}
      {!readonly && (
        <form onSubmit={handleAddSubmit} className="flex gap-2 mt-2">
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Add a step or sub-task..."
            maxLength={120}
            className="flex-1 bg-surface2 text-ink border border-control rounded-control px-3 py-1.5 text-xs placeholder:text-muted/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={!newText.trim()}
            className="text-xs shrink-0 py-1"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
