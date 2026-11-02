import { Item, Priority } from './schema';
import { isOverdue } from './dates';

export interface FilterCriteria {
  q?: string;
  categoryIds?: string[];
  priorities?: Priority[];
  status?: 'all' | 'pending' | 'completed' | 'overdue';
  sort?: 'dateAdded' | 'targetDate' | 'priority' | 'title';
  dir?: 'asc' | 'desc';
}

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Filter, search, and sort items per PRD Section 6.2 and 12.2
 */
export function selectVisibleItems(items: Item[], criteria: FilterCriteria = {}): Item[] {
  const {
    q = '',
    categoryIds = [],
    priorities = [],
    status = 'all',
    sort = 'dateAdded',
    dir = 'desc',
  } = criteria;

  const normalizedQuery = normalizeText(q.trim());

  const filtered = items.filter((item) => {
    // 1. Search (title, description, tags)
    if (normalizedQuery) {
      const matchTitle = normalizeText(item.title).includes(normalizedQuery);
      const matchDesc = normalizeText(item.description).includes(normalizedQuery);
      const matchTags = item.tags.some((t) => normalizeText(t).includes(normalizedQuery));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    // 2. Category filter
    if (categoryIds.length > 0 && !categoryIds.includes(item.categoryId)) {
      return false;
    }

    // 3. Priority filter
    if (priorities.length > 0 && !priorities.includes(item.priority)) {
      return false;
    }

    // 4. Status filter
    if (status === 'pending' && item.status !== 'pending') return false;
    if (status === 'completed' && item.status !== 'completed') return false;
    if (status === 'overdue') {
      if (item.status !== 'pending' || !isOverdue(item.targetDate, item.status)) {
        return false;
      }
    }

    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;

    switch (sort) {
      case 'targetDate': {
        // Items without targetDate sort last
        if (!a.targetDate && !b.targetDate) comparison = 0;
        else if (!a.targetDate) return 1;
        else if (!b.targetDate) return -1;
        else comparison = a.targetDate.localeCompare(b.targetDate);
        break;
      }
      case 'priority': {
        comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (comparison === 0) {
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        break;
      }
      case 'title': {
        comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        break;
      }
      case 'dateAdded':
      default: {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      }
    }

    return dir === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

export interface ProgressSummary {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  percentage: number;
}

export function selectProgress(items: Item[]): ProgressSummary {
  const total = items.length;
  if (total === 0) {
    return { total: 0, completed: 0, pending: 0, overdue: 0, percentage: 0 };
  }

  const completed = items.filter((i) => i.status === 'completed').length;
  const overdue = items.filter((i) => i.status === 'pending' && isOverdue(i.targetDate, i.status)).length;
  const pending = total - completed;
  const percentage = Math.round((completed / total) * 100);

  return { total, completed, pending, overdue, percentage };
}

export interface CategoryProgress {
  categoryId: string;
  total: number;
  completed: number;
  percentage: number;
}

export function selectCategoryProgress(items: Item[]): Record<string, CategoryProgress> {
  const result: Record<string, CategoryProgress> = {};

  for (const item of items) {
    const entry = result[item.categoryId] ?? {
      categoryId: item.categoryId,
      total: 0,
      completed: 0,
      percentage: 0,
    };
    entry.total += 1;
    if (item.status === 'completed') entry.completed += 1;
    result[item.categoryId] = entry;
  }

  for (const key of Object.keys(result)) {
    const entry = result[key]!;
    entry.percentage = entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0;
  }

  return result;
}

export interface StreaksSummary {
  current: number;
  longest: number;
}

/**
 * Month-based streak per PRD Section 6.5
 * Consecutive calendar months ending this month or last month with >= 1 completion.
 */
export function selectStreaks(items: Item[]): StreaksSummary {
  const completedDates = items
    .filter((i) => i.status === 'completed' && i.completedAt)
    .map((i) => new Date(i.completedAt!));

  if (completedDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Extract unique year-months (YYYY-MM) in chronological order
  const monthSet = new Set<string>();
  for (const date of completedDates) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    monthSet.add(`${y}-${m}`);
  }

  const sortedMonths = Array.from(monthSet).sort();
  if (sortedMonths.length === 0) return { current: 0, longest: 0 };

  // Helper to get next month string
  const getNextMonth = (ym: string): string => {
    const [yStr, mStr] = ym.split('-');
    const y = parseInt(yStr!, 10);
    const m = parseInt(mStr!, 10);
    if (m === 12) return `${y + 1}-01`;
    return `${y}-${String(m + 1).padStart(2, '0')}`;
  };

  let maxStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedMonths.length; i++) {
    const prev = sortedMonths[i - 1]!;
    const curr = sortedMonths[i]!;
    if (getNextMonth(prev) === curr) {
      tempStreak += 1;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    } else {
      tempStreak = 1;
    }
  }

  // Current streak calculation
  const now = new Date();
  const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthYm = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const lastCompletedMonth = sortedMonths[sortedMonths.length - 1]!;
  let currentStreak = 0;

  if (lastCompletedMonth === currentYm || lastCompletedMonth === lastMonthYm) {
    currentStreak = 1;
    for (let i = sortedMonths.length - 2; i >= 0; i--) {
      const cur = sortedMonths[i]!;
      const nxt = sortedMonths[i + 1]!;
      if (getNextMonth(cur) === nxt) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    current: currentStreak,
    longest: maxStreak,
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progressText?: string;
}

/**
 * Derived badges per PRD Section 6.5
 */
export function selectBadges(items: Item[]): Badge[] {
  const completed = items.filter((i) => i.status === 'completed');
  const completedCount = completed.length;
  const streaks = selectStreaks(items);

  const travelCompleted = completed.filter((i) => i.categoryId === 'cat_travel').length;
  const hasPlanner = items.some(
    (i) => i.checklist.length >= 5 && i.checklist.every((c) => c.done)
  );
  const hasSaver = items.some(
    (i) => i.budget && i.budget.estimated > 0 && i.budget.saved >= i.budget.estimated
  );

  return [
    {
      id: 'badge_first_step',
      name: 'First Step',
      description: 'Completed your first life goal',
      icon: '🌱',
      unlocked: completedCount >= 1,
      progressText: `${Math.min(completedCount, 1)}/1`,
    },
    {
      id: 'badge_high_five',
      name: 'High Five',
      description: 'Achieved 5 bucket list dreams',
      icon: '✋',
      unlocked: completedCount >= 5,
      progressText: `${Math.min(completedCount, 5)}/5`,
    },
    {
      id: 'badge_double_digits',
      name: 'Double Digits',
      description: 'Achieved 10 goals',
      icon: '⚡',
      unlocked: completedCount >= 10,
      progressText: `${Math.min(completedCount, 10)}/10`,
    },
    {
      id: 'badge_quarter_century',
      name: 'Quarter Century',
      description: '25 dreams turned into memories',
      icon: '💎',
      unlocked: completedCount >= 25,
      progressText: `${Math.min(completedCount, 25)}/25`,
    },
    {
      id: 'badge_globetrotter',
      name: 'Globetrotter',
      description: 'Completed 3 travel adventures',
      icon: '✈️',
      unlocked: travelCompleted >= 3,
      progressText: `${Math.min(travelCompleted, 3)}/3 in Travel`,
    },
    {
      id: 'badge_planner',
      name: 'Master Planner',
      description: 'Goal completed with 5+ checklist tasks done',
      icon: '📋',
      unlocked: hasPlanner,
    },
    {
      id: 'badge_saver',
      name: 'Goal Funded',
      description: '100% of a goal budget saved',
      icon: '💰',
      unlocked: hasSaver,
    },
    {
      id: 'badge_streak_3',
      name: '3-Month Flow',
      description: 'Completed dreams 3 consecutive months',
      icon: '🔥',
      unlocked: streaks.longest >= 3,
      progressText: `${streaks.current}/3 months`,
    },
  ];
}

export function selectDueSoon(items: Item[], limit = 5): Item[] {
  return items
    .filter((i) => i.status === 'pending' && i.targetDate)
    .sort((a, b) => (a.targetDate! < b.targetDate! ? -1 : 1))
    .slice(0, limit);
}

export function selectNextRecommendation(items: Item[]): Item | null {
  const pending = items.filter((i) => i.status === 'pending');
  if (pending.length === 0) return null;

  return [...pending].sort((a, b) => {
    // Priority order first
    const prioDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (prioDiff !== 0) return prioDiff;

    // Target date second
    if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
    if (a.targetDate) return -1;
    if (b.targetDate) return 1;

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  })[0]!;
}

export function selectRandomPending(items: Item[]): Item | null {
  const pending = items.filter((i) => i.status === 'pending');
  if (pending.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pending.length);
  return pending[randomIndex]!;
}
