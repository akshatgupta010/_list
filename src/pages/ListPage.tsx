import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowUpDown,
  Plus,
  X,
  Compass,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { selectVisibleItems, FilterCriteria } from '@/lib/selectors';
import { ItemCard } from '@/components/items/ItemCard';
import { ItemRow } from '@/components/items/ItemRow';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Priority } from '@/lib/schema';

export function ListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const items = useAppStore((s) => s.items);
  const categories = useAppStore((s) => s.categories);
  const viewMode = useAppStore((s) => s.settings.viewMode);
  const updateSettings = useAppStore((s) => s.updateSettings);

  // Read URL query params
  const qParam = searchParams.get('q') || '';
  const statusParam = (searchParams.get('status') as FilterCriteria['status']) || 'all';
  const sortParam = (searchParams.get('sort') as FilterCriteria['sort']) || 'dateAdded';
  const dirParam = (searchParams.get('dir') as FilterCriteria['dir']) || 'desc';
  const categoriesParam = searchParams.getAll('category');
  const prioritiesParam = searchParams.getAll('priority') as Priority[];

  // Local state for debounced search
  const [searchInput, setSearchInput] = useState(qParam);

  // Sync debounced search to URL query string
  useEffect(() => {
    const timer = setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        nextParams.set('q', searchInput.trim());
      } else {
        nextParams.delete('q');
      }
      setSearchParams(nextParams, { replace: true });
    }, 150);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParam = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'all') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const toggleArrayParam = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    const existing = nextParams.getAll(key);
    nextParams.delete(key);

    if (existing.includes(value)) {
      existing.filter((v) => v !== value).forEach((v) => nextParams.append(key, v));
    } else {
      [...existing, value].forEach((v) => nextParams.append(key, v));
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  // Filter criteria computation
  const criteria: FilterCriteria = useMemo(
    () => ({
      q: qParam,
      status: statusParam,
      categoryIds: categoriesParam,
      priorities: prioritiesParam,
      sort: sortParam,
      dir: dirParam,
    }),
    [qParam, statusParam, categoriesParam, prioritiesParam, sortParam, dirParam]
  );

  const visibleItems = useMemo(() => selectVisibleItems(items, criteria), [items, criteria]);

  const hasActiveFilters =
    Boolean(qParam) ||
    statusParam !== 'all' ||
    categoriesParam.length > 0 ||
    prioritiesParam.length > 0;

  const getCategory = (catId: string) => categories.find((c) => c.id === catId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Controls: Title, View Switcher, Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
            My Bucket List
          </h1>
          <p
            aria-live="polite"
            className="text-xs font-mono text-muted mt-0.5 tracking-wider uppercase"
          >
            Showing {visibleItems.length} of {items.length} goals
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-surface2 border border-control rounded-control p-0.5">
            <button
              onClick={() => updateSettings({ viewMode: 'grid' })}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSettings({ viewMode: 'list' })}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
              aria-label="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <Link to="/add">
            <Button variant="chrome" size="sm" className="font-mono text-xs uppercase tracking-wider">
              <Plus className="w-4 h-4 mr-1" />
              Add Dream
            </Button>
          </Link>
        </div>
      </div>

      {/* Search, Status Tabs & Filter Controls */}
      <div className="glass-panel corner-brackets rounded-card border border-line p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Debounced Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search dreams, reflections, tags..."
              className="w-full bg-surface2 text-ink pl-9 pr-8 py-2 text-sm border border-control rounded-control placeholder:text-muted/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Segmented Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 font-mono text-xs">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'completed', label: 'Completed' },
                { id: 'overdue', label: 'Overdue' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => updateParam('status', tab.id)}
                className={`px-3 py-1.5 rounded-control transition-all uppercase tracking-wider whitespace-nowrap ${
                  statusParam === tab.id
                    ? 'bg-ink text-bg font-semibold shadow-sm'
                    : 'bg-surface2 text-muted hover:text-ink border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 font-mono text-xs shrink-0">
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-surface2 text-ink border border-control rounded-control px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ink"
            >
              <option value="dateAdded">Sort: Date Added</option>
              <option value="targetDate">Sort: Target Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="title">Sort: Alphabetical</option>
            </select>

            <button
              onClick={() => updateParam('dir', dirParam === 'asc' ? 'desc' : 'asc')}
              className="p-2 rounded-control bg-surface2 border border-control text-muted hover:text-ink"
              aria-label="Toggle sort direction"
              title={`Sorting ${dirParam === 'asc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-line/40">
          <span className="text-[11px] font-mono text-muted uppercase tracking-wider mr-1">
            Category:
          </span>
          {categories.map((cat) => {
            const isSelected = categoriesParam.includes(cat.id);
            return (
              <Chip
                key={cat.id}
                active={isSelected}
                onClick={() => toggleArrayParam('category', cat.id)}
              >
                {cat.name}
              </Chip>
            );
          })}
        </div>

        {/* Priority Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-muted uppercase tracking-wider mr-1">
            Priority:
          </span>
          {(['high', 'medium', 'low'] as const).map((prio) => {
            const isSelected = prioritiesParam.includes(prio);
            return (
              <Chip
                key={prio}
                active={isSelected}
                onClick={() => toggleArrayParam('priority', prio)}
                className="capitalize"
              >
                {prio}
              </Chip>
            );
          })}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-mono text-danger hover:underline ml-auto flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Item Listing or Empty States */}
      {visibleItems.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleItems.map((item) => (
              <ItemCard key={item.id} item={item} category={getCategory(item.categoryId)} />
            ))}
          </div>
        ) : (
          <div className="space-y-2.5">
            {visibleItems.map((item) => (
              <ItemRow key={item.id} item={item} category={getCategory(item.categoryId)} />
            ))}
          </div>
        )
      ) : hasActiveFilters ? (
        <EmptyState
          icon="🔍"
          title="No Goals Found"
          description="None of your bucket list items match the current filters and search query."
          action={{
            label: 'Clear Filters',
            onClick: clearAllFilters,
          }}
        />
      ) : (
        <EmptyState
          icon="🌌"
          title="Your List is Empty"
          description="Start building your life vision by capturing your first dream or exploring pre-made ideas."
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link to="/add">
              <Button variant="chrome" size="sm" className="font-mono text-xs uppercase tracking-wider">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Goal
              </Button>
            </Link>
            <Link to="/explore">
              <Button variant="secondary" size="sm" className="font-mono text-xs uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 mr-1" />
                Explore Ideas
              </Button>
            </Link>
          </div>
        </EmptyState>
      )}
    </div>
  );
}
