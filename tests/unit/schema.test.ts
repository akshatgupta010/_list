import { describe, it, expect } from 'vitest';
import { ItemSchema, StateSchema, INITIAL_STATE } from '@/lib/schema';

describe('Zod Schema Validation', () => {
  it('validates a correct Item and applies default values', () => {
    const validItem = {
      id: 'item_1',
      title: 'Scuba dive in Australia',
      categoryId: 'cat_adventure',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const parsed = ItemSchema.parse(validItem);
    expect(parsed.title).toBe('Scuba dive in Australia');
    expect(parsed.priority).toBe('medium');
    expect(parsed.status).toBe('pending');
    expect(parsed.emoji).toBe('✨');
    expect(parsed.checklist).toEqual([]);
    expect(parsed.tags).toEqual([]);
  });

  it('rejects an empty title', () => {
    const invalidItem = {
      id: 'item_2',
      title: '   ',
      categoryId: 'cat_travel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => ItemSchema.parse(invalidItem)).toThrow();
  });

  it('rejects title longer than 80 chars', () => {
    const longTitle = 'A'.repeat(81);
    const item = {
      id: 'item_3',
      title: longTitle,
      categoryId: 'cat_travel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(() => ItemSchema.parse(item)).toThrow();
  });

  it('validates and passes INITIAL_STATE', () => {
    const parsed = StateSchema.parse(INITIAL_STATE);
    expect(parsed.version).toBe(1);
    expect(parsed.categories.length).toBeGreaterThan(0);
    expect(parsed.items).toEqual([]);
  });
});
