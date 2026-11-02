import { useState, useMemo } from 'react';
import { Sparkles, Plus, Check, Shuffle } from 'lucide-react';
import { INSPIRATION_ITEMS, InspirationItem } from '@/features/explore/inspiration';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

export function ExplorePage() {
  const { toast } = useToast();
  const items = useAppStore((s) => s.items);
  const categories = useAppStore((s) => s.categories);
  const addItem = useAppStore((s) => s.addItem);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [surpriseItem, setSurpriseItem] = useState<InspirationItem | null>(null);

  // Set of already added inspiration IDs
  const addedIds = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.createdFrom.startsWith('inspiration:')) {
        set.add(i.createdFrom.replace('inspiration:', ''));
      }
      // Also match by identical title
      set.add(i.title.toLowerCase());
    });
    return set;
  }, [items]);

  const filteredInspiration = useMemo(() => {
    if (selectedCategory === 'all') return INSPIRATION_ITEMS;
    return INSPIRATION_ITEMS.filter((item) => item.categoryId === selectedCategory);
  }, [selectedCategory]);

  const handleAddGoal = (insp: InspirationItem) => {
    // Check if target category exists, fallback to cat_other
    const hasCategory = categories.some((c) => c.id === insp.categoryId);
    const categoryId = hasCategory ? insp.categoryId : 'cat_other';

    addItem({
      title: insp.title,
      description: insp.description,
      categoryId,
      priority: insp.priority,
      emoji: insp.emoji,
      tags: insp.tags,
    });

    toast({
      title: 'Added to Bucket List',
      description: `"${insp.title}" added to your goals.`,
    });
  };

  const handleSurpriseMe = () => {
    const unadded = INSPIRATION_ITEMS.filter(
      (i) => !addedIds.has(i.id) && !addedIds.has(i.title.toLowerCase())
    );
    const pool = unadded.length > 0 ? unadded : INSPIRATION_ITEMS;
    const randomIndex = Math.floor(Math.random() * pool.length);
    setSurpriseItem(pool[randomIndex]!);
  };

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || 'Life';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-accent mb-1 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Curated Dreams Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
            Inspiration & Ideas
          </h1>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleSurpriseMe}
          className="font-mono text-xs uppercase tracking-wider gap-1.5"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Surprise Idea
        </Button>
      </div>

      {/* Featured Surprise Highlight */}
      {surpriseItem && (
        <div className="glass-panel corner-brackets rounded-card border border-accent/40 bg-accent/5 p-6 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-accent font-semibold">
              // Suggested Idea
            </span>
            <button
              onClick={() => setSurpriseItem(null)}
              className="text-xs font-mono text-muted hover:text-ink"
            >
              Dismiss
            </button>
          </div>

          <div className="flex items-start gap-3.5">
            <span className="text-3xl select-none">{surpriseItem.emoji}</span>
            <div className="space-y-1 flex-1">
              <h3 className="text-lg font-display font-bold text-ink">{surpriseItem.title}</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {surpriseItem.description}
              </p>
            </div>
            <Button
              variant="chrome"
              size="sm"
              onClick={() => handleAddGoal(surpriseItem)}
              disabled={addedIds.has(surpriseItem.id) || addedIds.has(surpriseItem.title.toLowerCase())}
              className="font-mono text-xs uppercase shrink-0"
            >
              {addedIds.has(surpriseItem.id) || addedIds.has(surpriseItem.title.toLowerCase()) ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-success" />
                  Added
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add to List
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pb-1">
        <Chip
          active={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        >
          All Ideas ({INSPIRATION_ITEMS.length})
        </Chip>
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            active={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Chip>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInspiration.map((item) => {
          const isAdded = addedIds.has(item.id) || addedIds.has(item.title.toLowerCase());

          return (
            <div
              key={item.id}
              className="glass-panel corner-brackets rounded-card border border-line p-5 flex flex-col justify-between space-y-4 hover:border-control transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted uppercase tracking-wider">
                    {getCategoryName(item.categoryId)}
                  </span>
                  <Badge variant={item.priority}>{item.priority}</Badge>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-2xl select-none shrink-0">{item.emoji}</span>
                  <div>
                    <h3 className="font-display font-semibold text-base text-ink leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-line/40 flex items-center justify-between">
                <div className="flex items-center gap-1 flex-wrap">
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono text-muted/70">
                      #{tag}
                    </span>
                  ))}
                </div>

                <Button
                  variant={isAdded ? 'secondary' : 'chrome'}
                  size="sm"
                  disabled={isAdded}
                  onClick={() => handleAddGoal(item)}
                  className="font-mono text-xs uppercase"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1 text-success" />
                      In List
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
