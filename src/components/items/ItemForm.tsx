import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Tag } from 'lucide-react';
import { Item, PriorityEnum } from '@/lib/schema';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { toMinorUnit, toMajorUnit } from '@/lib/money';
import { Dialog } from '@/components/ui/Dialog';
import { useAppStore } from '@/store/useAppStore';

const FormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(80, 'Maximum 80 characters'),
  description: z.string().max(1000, 'Maximum 1000 characters').default(''),
  categoryId: z.string().min(1, 'Please select a category'),
  priority: PriorityEnum,
  targetDate: z.string().optional(),
  emoji: z.string().min(1).max(8).default('✨'),
  horizon: z.string().max(40, 'Maximum 40 characters').optional(),
  tagsText: z.string().default(''),
  budgetEstimated: z.string().optional(),
  budgetSaved: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export interface ItemFormProps {
  initialItem?: Item;
  onSubmit: (values: {
    title: string;
    description: string;
    categoryId: string;
    priority: 'high' | 'medium' | 'low';
    targetDate: string | null;
    emoji: string;
    horizon: string | null;
    tags: string[];
    budget: { estimated: number; saved: number } | null;
  }) => void;
  onCancel: () => void;
}

const COMMON_EMOJIS = ['✨', '🌌', '✈️', '🏔️', '🌊', '🚀', '🎨', '📚', '🎯', '💡', '🎸', '🏃', '🏕️', '🏛️', '🌟'];

export function ItemForm({ initialItem, onSubmit, onCancel }: ItemFormProps) {
  const categories = useAppStore((s) => s.categories);
  const addCategory = useAppStore((s) => s.addCategory);
  const currency = useAppStore((s) => s.settings.currency);

  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catError, setCatError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: initialItem?.title || '',
      description: initialItem?.description || '',
      categoryId: initialItem?.categoryId || categories[0]?.id || 'cat_other',
      priority: initialItem?.priority || 'medium',
      targetDate: initialItem?.targetDate || '',
      emoji: initialItem?.emoji || '✨',
      horizon: initialItem?.horizon || '',
      tagsText: initialItem?.tags.join(', ') || '',
      budgetEstimated: initialItem?.budget ? String(toMajorUnit(initialItem.budget.estimated)) : '',
      budgetSaved: initialItem?.budget ? String(toMajorUnit(initialItem.budget.saved)) : '',
    },
  });

  const selectedPriority = watch('priority');
  const selectedEmoji = watch('emoji');

  const handleFormSubmit = (data: FormValues) => {
    const tags = data.tagsText
      ? data.tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 10)
      : [];

    let budget = null;
    if (data.budgetEstimated && parseFloat(data.budgetEstimated) > 0) {
      budget = {
        estimated: toMinorUnit(data.budgetEstimated),
        saved: data.budgetSaved ? toMinorUnit(data.budgetSaved) : 0,
      };
    }

    onSubmit({
      title: data.title.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      priority: data.priority,
      targetDate: data.targetDate ? data.targetDate : null,
      emoji: data.emoji.trim() || '✨',
      horizon: data.horizon?.trim() || null,
      tags,
      budget,
    });
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const created = addCategory(newCatName.trim());
    if (created) {
      setValue('categoryId', created.id);
      setIsAddCatOpen(false);
      setNewCatName('');
      setCatError('');
    } else {
      setCatError('Category already exists or invalid name.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Emoji Selector + Title */}
        <div className="space-y-2">
          <label className="block text-xs font-mono uppercase tracking-wider text-muted font-medium">
            Goal Icon & Title *
          </label>
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="text"
                {...register('emoji')}
                maxLength={8}
                className="w-14 h-10 text-center text-xl bg-surface2 border border-control rounded-control focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
              />
            </div>
            <div className="flex-1">
              <Input
                {...register('title')}
                placeholder="e.g. Scuba dive in the Great Barrier Reef"
                error={errors.title?.message}
                maxLength={80}
              />
            </div>
          </div>

          {/* Quick emoji palette */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {COMMON_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setValue('emoji', e)}
                className={`p-1.5 text-base rounded-md hover:bg-surface2 transition-all ${
                  selectedEmoji === e ? 'bg-surface2 border border-control scale-110' : ''
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <Textarea
          label="Description & Why it matters"
          placeholder="What makes this dream special? Add any notes or personal motivation..."
          {...register('description')}
          error={errors.description?.message}
          rows={3}
        />

        {/* Category & New Category Inline Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
                Category *
              </label>
              <button
                type="button"
                onClick={() => setIsAddCatOpen(true)}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                New Category
              </button>
            </div>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.categoryId?.message}
                />
              )}
            />
          </div>

          {/* Priority Segmented Control */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-muted font-medium">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-1 bg-surface2 p-1 rounded-control border border-control">
              {(['high', 'medium', 'low'] as const).map((prio) => (
                <button
                  key={prio}
                  type="button"
                  onClick={() => setValue('priority', prio)}
                  className={`py-1.5 text-xs font-mono uppercase tracking-wider rounded transition-all capitalize ${
                    selectedPriority === prio
                      ? 'bg-ink text-bg font-semibold shadow-sm'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target Date & Horizon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Target Date (Optional)"
            {...register('targetDate')}
            error={errors.targetDate?.message}
          />
          <Input
            label="Life Horizon / Milestone"
            placeholder="e.g. Before 30, Summer 2027"
            {...register('horizon')}
            error={errors.horizon?.message}
            maxLength={40}
          />
        </div>

        {/* Budget Tracker (Estimated & Saved) */}
        <div className="p-4 rounded-card bg-surface2/40 border border-line/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
              Budget Planning ({currency})
            </span>
            <span className="text-[11px] text-muted">Optional</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="Estimated cost"
              label="Estimated Cost"
              {...register('budgetEstimated')}
            />
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="Saved so far"
              label="Amount Saved"
              {...register('budgetSaved')}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-muted font-medium">
            <Tag className="w-3.5 h-3.5" />
            Tags (comma separated)
          </label>
          <Input
            placeholder="e.g. solo, winter, bucket-list, nature"
            {...register('tagsText')}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-line/60">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="chrome"
            disabled={isSubmitting}
            className="font-mono text-xs uppercase tracking-wider"
          >
            {initialItem ? 'Save Changes' : 'Create Goal'}
          </Button>
        </div>
      </form>

      {/* New Category Modal */}
      <Dialog
        isOpen={isAddCatOpen}
        onClose={() => setIsAddCatOpen(false)}
        title="Add Custom Category"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Culinary, Mindset, Creative"
            value={newCatName}
            onChange={(e) => {
              setNewCatName(e.target.value);
              setCatError('');
            }}
            error={catError}
            maxLength={24}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddCatOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Category
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
