import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, ArrowRight, Folder } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { selectCategoryProgress } from '@/lib/selectors';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Category } from '@/lib/schema';
import { useToast } from '@/components/ui/Toast';

export function CategoriesPage() {
  const { toast } = useToast();

  const categories = useAppStore((s) => s.categories);
  const items = useAppStore((s) => s.items);
  const addCategory = useAppStore((s) => s.addCategory);
  const renameCategory = useAppStore((s) => s.renameCategory);
  const deleteCategory = useAppStore((s) => s.deleteCategory);

  const categoryProgress = selectCategoryProgress(items);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [addError, setAddError] = useState('');

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const res = addCategory(newCatName.trim());
    if (res) {
      toast({ title: 'Category Created', description: `"${res.name}" added.` });
      setNewCatName('');
      setIsAddOpen(false);
      setAddError('');
    } else {
      setAddError('Category name already exists or max limit reached (20).');
    }
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    const ok = renameCategory(editingCategory.id, editName.trim());
    if (ok) {
      toast({ title: 'Category Renamed', description: `Renamed to "${editName.trim()}".` });
      setEditingCategory(null);
      setEditName('');
      setEditError('');
    } else {
      setEditError('Unable to rename category.');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingCategory) return;
    const count = categoryProgress[deletingCategory.id]?.total || 0;
    const ok = deleteCategory(deletingCategory.id);
    if (ok) {
      toast({
        title: 'Category Removed',
        description: `"${deletingCategory.name}" deleted. ${count} goals reassigned to "Other".`,
      });
      setDeletingCategory(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
            Life Categories
          </h1>
          <p className="text-xs font-mono text-muted uppercase tracking-wider mt-0.5">
            Organize & balance your priorities ({categories.length}/20 categories)
          </p>
        </div>

        <Button
          variant="chrome"
          size="sm"
          onClick={() => setIsAddOpen(true)}
          className="font-mono text-xs uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Category
        </Button>
      </div>

      {/* Grid of categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const stats = categoryProgress[cat.id] || { total: 0, completed: 0, percentage: 0 };

          return (
            <div
              key={cat.id}
              className="glass-panel corner-brackets rounded-card border border-line p-5 space-y-4 hover:border-control transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-accent" />
                    <h3 className="font-display font-semibold text-base text-ink">
                      {cat.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setEditName(cat.name);
                      }}
                      className="p-1 rounded text-muted hover:text-ink hover:bg-surface2"
                      aria-label={`Rename category ${cat.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {!cat.isDefault && (
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="p-1 rounded text-muted hover:text-danger hover:bg-surface2"
                        aria-label={`Delete category ${cat.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono text-muted mb-2">
                  <span>{stats.total} {stats.total === 1 ? 'Goal' : 'Goals'}</span>
                  <span className="text-success font-medium">{stats.completed} Achieved</span>
                </div>

                <ProgressBar
                  value={stats.percentage}
                  showPercentage={true}
                  size="sm"
                />
              </div>

              <div className="pt-3 border-t border-line/40 flex justify-end">
                <Link
                  to={`/list?category=${cat.id}`}
                  className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                >
                  <span>View Goals</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Dialog */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Category"
        description="Add a custom category for your goals (1–24 characters)."
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Spirituality, Music, Creative"
            value={newCatName}
            onChange={(e) => {
              setNewCatName(e.target.value);
              setAddError('');
            }}
            error={addError}
            maxLength={24}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Category
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Rename Category Dialog */}
      <Dialog
        isOpen={Boolean(editingCategory)}
        onClose={() => setEditingCategory(null)}
        title="Rename Category"
      >
        <form onSubmit={handleRenameSubmit} className="space-y-4">
          <Input
            label="New Name"
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
              setEditError('');
            }}
            error={editError}
            maxLength={24}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Name
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        title="Delete Category?"
        description={
          deletingCategory
            ? `Are you sure you want to delete "${deletingCategory.name}"? The ${
                categoryProgress[deletingCategory.id]?.total || 0
              } goals in this category will be safely reassigned to "Other".`
            : ''
        }
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={() => setDeletingCategory(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete & Reassign Goals
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
