import { describe, it, expect } from 'vitest';
import {
  selectVisibleItems,
  selectProgress,
  selectBadges,
} from '@/lib/selectors';
import { Item } from '@/lib/schema';

describe('Selectors', () => {
  const mockItems: Item[] = [
    {
      id: '1',
      title: 'Scuba diving in Great Barrier Reef',
      description: 'Coral and sea turtles',
      categoryId: 'cat_adventure',
      priority: 'high',
      tags: ['ocean', 'diving'],
      horizon: '2027',
      targetDate: '2025-01-01', // in the past -> overdue if pending
      status: 'pending',
      completedAt: null,
      reflection: '',
      checklist: [
        { id: 'c1', text: 'Step 1', done: true },
        { id: 'c2', text: 'Step 2', done: true },
        { id: 'c3', text: 'Step 3', done: true },
        { id: 'c4', text: 'Step 4', done: true },
        { id: 'c5', text: 'Step 5', done: true },
      ],
      budget: { estimated: 100000, saved: 120000 },
      emoji: '🤿',
      photos: [],
      order: 0,
      createdFrom: 'manual',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Hike Mount Fuji',
      description: 'Sunrise at the summit',
      categoryId: 'cat_travel',
      priority: 'medium',
      tags: ['japan'],
      horizon: null,
      targetDate: '2027-08-01',
      status: 'completed',
      completedAt: '2026-05-15T12:00:00.000Z',
      reflection: 'Unbelievable morning light.',
      checklist: [],
      budget: null,
      emoji: '🗻',
      photos: [],
      order: 1,
      createdFrom: 'manual',
      createdAt: '2026-01-02T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Learn Italian Cooking',
      description: 'Handmade pasta',
      categoryId: 'cat_learning',
      priority: 'low',
      tags: ['culinary'],
      horizon: null,
      targetDate: null,
      status: 'pending',
      completedAt: null,
      reflection: '',
      checklist: [],
      budget: null,
      emoji: '🍝',
      photos: [],
      order: 2,
      createdFrom: 'manual',
      createdAt: '2026-01-03T00:00:00.000Z',
      updatedAt: '2026-01-03T00:00:00.000Z',
    },
  ];

  it('filters by search keyword in title, description, or tags', () => {
    const result = selectVisibleItems(mockItems, { q: 'pasta' });
    expect(result.length).toBe(1);
    expect(result[0]?.id).toBe('3');

    const resultTag = selectVisibleItems(mockItems, { q: 'diving' });
    expect(resultTag.length).toBe(1);
    expect(resultTag[0]?.id).toBe('1');
  });

  it('filters by status: overdue', () => {
    const result = selectVisibleItems(mockItems, { status: 'overdue' });
    expect(result.length).toBe(1);
    expect(result[0]?.id).toBe('1');
  });

  it('sorts by priority correctly (high, medium, low)', () => {
    const sorted = selectVisibleItems(mockItems, { sort: 'priority', dir: 'asc' });
    expect(sorted[0]?.priority).toBe('high');
    expect(sorted[1]?.priority).toBe('medium');
    expect(sorted[2]?.priority).toBe('low');
  });

  it('calculates progress accurately', () => {
    const progress = selectProgress(mockItems);
    expect(progress.total).toBe(3);
    expect(progress.completed).toBe(1);
    expect(progress.pending).toBe(2);
    expect(progress.overdue).toBe(1);
    expect(progress.percentage).toBe(33); // 1 / 3 = 33%
  });

  it('detects unlocked badges (First Step, Master Planner, Goal Funded)', () => {
    const badges = selectBadges(mockItems);
    const firstStep = badges.find((b) => b.id === 'badge_first_step');
    expect(firstStep?.unlocked).toBe(true);

    const planner = badges.find((b) => b.id === 'badge_planner');
    expect(planner?.unlocked).toBe(true); // mockItem 1 has 5 checklist items, all done

    const saver = badges.find((b) => b.id === 'badge_saver');
    expect(saver?.unlocked).toBe(true); // mockItem 1 has saved >= estimated
  });
});
