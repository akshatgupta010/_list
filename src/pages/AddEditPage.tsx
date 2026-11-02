import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { ItemForm } from '@/components/items/ItemForm';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

export function AddEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const items = useAppStore((s) => s.items);
  const addItem = useAppStore((s) => s.addItem);
  const updateItem = useAppStore((s) => s.updateItem);

  const existingItem = id ? items.find((i) => i.id === id) : undefined;
  const isEditing = Boolean(id);

  if (isEditing && !existingItem) {
    return (
      <div className="py-12 max-w-lg mx-auto text-center space-y-4">
        <h2 className="text-xl font-display font-bold text-ink">Goal Not Found</h2>
        <p className="text-sm text-muted">
          The bucket list item you are trying to edit does not exist or has been deleted.
        </p>
        <Button variant="secondary" onClick={() => navigate('/list')}>
          Back to List
        </Button>
      </div>
    );
  }

  const handleSubmit = (values: {
    title: string;
    description: string;
    categoryId: string;
    priority: 'high' | 'medium' | 'low';
    targetDate: string | null;
    emoji: string;
    horizon: string | null;
    tags: string[];
    budget: { estimated: number; saved: number } | null;
  }) => {
    if (isEditing && existingItem) {
      updateItem(existingItem.id, values);
      toast({
        title: 'Goal Updated',
        description: `"${values.title}" has been saved.`,
      });
      navigate(`/item/${existingItem.id}`);
    } else {
      const created = addItem(values);
      toast({
        title: 'Dream Captured',
        description: `"${values.title}" added to your list.`,
      });
      navigate(`/item/${created.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="p-1.5 text-muted hover:text-ink rounded-lg"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold text-ink tracking-tight">
            {isEditing ? 'Edit Goal' : 'Add New Dream'}
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-wider mt-0.5">
            {isEditing ? 'Modify parameters & milestones' : 'Capture an aspiration for life'}
          </p>
        </div>
      </div>

      <div className="glass-panel corner-brackets rounded-card border border-line p-6 sm:p-8 shadow-sm">
        <ItemForm
          initialItem={existingItem}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
