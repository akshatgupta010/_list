import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Quote, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatLocalDate } from '@/lib/dates';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export function CompletedPage() {
  const items = useAppStore((s) => s.items);
  const categories = useAppStore((s) => s.categories);

  const completedItems = useMemo(
    () =>
      items
        .filter((i) => i.status === 'completed')
        .sort((a, b) => {
          const dateA = a.completedAt || a.createdAt;
          const dateB = b.completedAt || b.createdAt;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        }),
    [items]
  );

  // Group by Year
  const years = useMemo(() => {
    const set = new Set<string>();
    completedItems.forEach((i) => {
      const d = new Date(i.completedAt || i.createdAt);
      set.add(String(d.getFullYear()));
    });
    return Array.from(set).sort().reverse();
  }, [completedItems]);

  const [selectedYear, setSelectedYear] = useState<string>('all');

  const filteredItems = useMemo(() => {
    if (selectedYear === 'all') return completedItems;
    return completedItems.filter((i) => {
      const d = new Date(i.completedAt || i.createdAt);
      return String(d.getFullYear()) === selectedYear;
    });
  }, [completedItems, selectedYear]);

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  if (completedItems.length === 0) {
    return (
      <div className="py-6 sm:py-8 max-w-md mx-auto animate-in fade-in duration-200">
        <EmptyState
          icon="🏆"
          title="Nothing Completed Yet"
          description="Your achieved milestones and reflections will land right here on your life timeline."
        >
          <div className="pt-3">
            <Link to="/list">
              <Button variant="chrome" size="sm" className="font-mono text-xs uppercase tracking-wider">
                Explore Your List
              </Button>
            </Link>
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-success mb-1 font-semibold">
            <Trophy className="w-4 h-4" />
            <span>Memories & Achievements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
            {completedItems.length} {completedItems.length === 1 ? 'Dream' : 'Dreams'} Achieved
          </h1>
        </div>

        {/* Year Filter */}
        {years.length > 1 && (
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-control transition-colors ${
                selectedYear === 'all'
                  ? 'bg-ink text-bg font-semibold'
                  : 'bg-surface2 text-muted hover:text-ink'
              }`}
            >
              All Years
            </button>
            {years.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-control transition-colors ${
                  selectedYear === yr
                    ? 'bg-ink text-bg font-semibold'
                    : 'bg-surface2 text-muted hover:text-ink'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Stream */}
      <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-line/60 before:hidden sm:before:block">
        {filteredItems.map((item) => {
          const compDate = item.completedAt
            ? formatLocalDate(item.completedAt.split('T')[0])
            : formatLocalDate(item.createdAt.split('T')[0]);

          return (
            <div
              key={item.id}
              className="relative flex items-start gap-4 sm:gap-6 group"
            >
              {/* Timeline marker icon */}
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-surface border border-line items-center justify-center text-lg select-none shrink-0 shadow-sm z-10 group-hover:scale-110 transition-transform">
                {item.emoji}
              </div>

              {/* Memory Card */}
              <div className="flex-1 glass-panel corner-brackets rounded-card border border-line p-5 sm:p-6 space-y-3 hover:border-control transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted">
                  <div className="flex items-center gap-2">
                    <span className="sm:hidden text-lg select-none">{item.emoji}</span>
                    <span className="uppercase tracking-wider font-semibold text-ink">
                      {getCategory(item.categoryId)?.name || 'Other'}
                    </span>
                  </div>

                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    {compDate}
                  </span>
                </div>

                <Link
                  to={`/item/${item.id}`}
                  className="block font-display font-bold text-lg text-ink hover:underline"
                >
                  {item.title}
                </Link>

                {item.description && (
                  <p className="text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}

                {item.reflection && (
                  <div className="p-3.5 rounded-control bg-surface2/60 border-l-2 border-accent text-xs sm:text-sm italic text-ink flex items-start gap-2.5">
                    <Quote className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <p className="leading-relaxed">"{item.reflection}"</p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/item/${item.id}`}
                    className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                  >
                    <span>View Memory Story</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
