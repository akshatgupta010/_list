import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Plus, Compass, Shuffle, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  selectProgress,
  selectDueSoon,
  selectNextRecommendation,
  selectRandomPending,
} from '@/lib/selectors';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ItemRow } from '@/components/items/ItemRow';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export function HomePage() {
  const name = useAppStore((s) => s.settings.name);
  const items = useAppStore((s) => s.items);
  const categories = useAppStore((s) => s.categories);

  const progress = selectProgress(items);
  const dueSoonItems = selectDueSoon(items, 4);
  const recommendedItem = selectNextRecommendation(items);

  const [surpriseItem, setSurpriseItem] = useState<typeof recommendedItem>(null);

  const activeFocusItem = surpriseItem || recommendedItem;
  const recentItems = [...items].slice(0, 4);

  const handleSurpriseMe = () => {
    const random = selectRandomPending(items);
    if (random) setSurpriseItem(random);
  };

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  // Empty state if user has no goals yet
  if (items.length === 0) {
    return (
      <div className="py-4 sm:py-6 px-4 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-surface text-xs font-mono text-muted mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>HORIZON // ZERO DATABASE • CLIENT ONLY</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-bold text-ink tracking-tight">
            Add Your First Dream.
          </h1>
          <p className="text-sm sm:text-base text-muted max-w-lg mx-auto leading-relaxed">
            Every great journey begins with a single intention. Capture the places you want to explore,
            skills to learn, and milestones you will remember for life.
          </p>
        </div>

        <EmptyState
          icon="🌌"
          title="Your Horizon is Clear"
          description="Everything stays inside this browser on this device. No sign up, no cloud tracking."
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/add">
              <Button variant="chrome" size="lg" className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Goal
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider">
                <Compass className="w-4 h-4 mr-1.5" />
                Explore Inspiration
              </Button>
            </Link>
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero / Greeting & Overall Progress */}
      <section className="glass-panel corner-brackets rounded-card border border-line p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-muted">
              Personal Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight mt-1">
              {name ? `Welcome back, ${name}` : 'Hello, Dreamer'}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-muted">
            <div className="text-center px-3 py-1.5 rounded-lg bg-surface2 border border-line/50">
              <span className="block text-base font-bold text-ink">{progress.total}</span>
              <span>Total</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-surface2 border border-line/50">
              <span className="block text-base font-bold text-success">{progress.completed}</span>
              <span>Achieved</span>
            </div>
            <div className="text-center px-3 py-1.5 rounded-lg bg-surface2 border border-line/50">
              <span className="block text-base font-bold text-ink">{progress.pending}</span>
              <span>Pending</span>
            </div>
          </div>
        </div>

        {/* Chrome Progress Bar */}
        <div className="space-y-2">
          <ProgressBar
            value={progress.percentage}
            label={`Overall Life Progress (${progress.completed} of ${progress.total} dreams)`}
            size="lg"
          />
        </div>
      </section>

      {/* Do This Next / Recommendation Panel */}
      {activeFocusItem && (
        <section className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-mono uppercase tracking-wider text-muted font-semibold">
                {surpriseItem ? 'Random Pick for Today' : 'Suggested Next Focus'}
              </h2>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSurpriseMe}
              className="text-xs font-mono py-1 px-2.5 gap-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Surprise Me
            </Button>
          </div>

          <div className="bg-surface2/60 rounded-control p-4 border border-line/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="text-3xl select-none">{activeFocusItem.emoji}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={activeFocusItem.priority}>{activeFocusItem.priority}</Badge>
                  <span className="text-[11px] font-mono text-muted">
                    {getCategory(activeFocusItem.categoryId)?.name}
                  </span>
                </div>
                <Link
                  to={`/item/${activeFocusItem.id}`}
                  className="font-display font-semibold text-lg text-ink hover:underline"
                >
                  {activeFocusItem.title}
                </Link>
                {activeFocusItem.description && (
                  <p className="text-xs text-muted line-clamp-1 mt-0.5">
                    {activeFocusItem.description}
                  </p>
                )}
              </div>
            </div>

            <Link to={`/item/${activeFocusItem.id}`} className="shrink-0 w-full md:w-auto">
              <Button variant="chrome" size="sm" className="w-full font-mono text-xs uppercase tracking-wider">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Grid: Due Soon / Overdue & Recently Added */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Due Soon / Overdue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-warning" />
              <h2 className="text-base font-display font-semibold text-ink tracking-tight">
                Upcoming Deadlines
              </h2>
            </div>
            <Link to="/list?status=overdue" className="text-xs font-mono text-accent hover:underline">
              View all
            </Link>
          </div>

          {dueSoonItems.length > 0 ? (
            <div className="space-y-2.5">
              {dueSoonItems.map((item) => (
                <ItemRow key={item.id} item={item} category={getCategory(item.categoryId)} />
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-card border border-line/60 bg-surface/40 text-center text-xs font-mono text-muted">
              <CheckCircle2 className="w-5 h-5 mx-auto mb-1.5 text-success/60" />
              No immediate deadlines on the horizon.
            </div>
          )}
        </div>

        {/* Recently Added */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-ink" />
              <h2 className="text-base font-display font-semibold text-ink tracking-tight">
                Recently Added
              </h2>
            </div>
            <Link to="/list" className="text-xs font-mono text-accent hover:underline">
              See all ({items.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentItems.map((item) => (
              <ItemRow key={item.id} item={item} category={getCategory(item.categoryId)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
