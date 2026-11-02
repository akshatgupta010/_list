import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadState,
  saveState,
  STORAGE_KEY,
  parseImport,
  mergeStates,
} from '@/lib/storage';
import { INITIAL_STATE, AppState } from '@/lib/schema';

describe('Storage Layer', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads seeded default state when localStorage is empty', () => {
    const result = loadState();
    expect(result.status).toBe('ok');
    expect(result.state.version).toBe(1);
    expect(result.state.categories.length).toBeGreaterThan(0);
  });

  it('saves and loads valid state correctly', () => {
    const customState: AppState = {
      ...INITIAL_STATE,
      settings: { ...INITIAL_STATE.settings, name: 'Explorer' },
    };

    const saveResult = saveState(customState);
    expect(saveResult).toBe('ok');

    const loaded = loadState();
    expect(loaded.status).toBe('ok');
    expect(loaded.state.settings.name).toBe('Explorer');
  });

  it('recovers gracefully from corrupted JSON and creates recovery key', () => {
    const corruptJson = '{ invalid_json_syntax: true, oops ';
    window.localStorage.setItem(STORAGE_KEY, corruptJson);

    const result = loadState();
    expect(result.status).toBe('recovered');
    expect(result.corruptedRaw).toBe(corruptJson);
    expect(result.state.version).toBe(1);

    // Verify corrupt key was stored
    const keys = Object.keys(window.localStorage);
    const hasCorruptKey = keys.some((k) => k.startsWith(`${STORAGE_KEY}:corrupt-`));
    expect(hasCorruptKey).toBe(true);
  });

  it('parses valid import JSON and generates preview', () => {
    const testState: AppState = {
      version: 1,
      items: [
        {
          id: 'imp_1',
          title: 'See the Aurora',
          description: '',
          categoryId: 'cat_travel',
          priority: 'high',
          tags: [],
          horizon: null,
          targetDate: '2027-01-01',
          status: 'pending',
          completedAt: null,
          reflection: '',
          checklist: [],
          budget: null,
          emoji: '🌌',
          photos: [],
          order: 0,
          createdFrom: 'manual',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      categories: INITIAL_STATE.categories,
      settings: INITIAL_STATE.settings,
    };

    const jsonStr = JSON.stringify(testState);
    const parsed = parseImport(jsonStr);

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.preview.itemsCount).toBe(1);
      expect(parsed.preview.categoriesCount).toBe(INITIAL_STATE.categories.length);
    }
  });

  it('rejects import if file size is too large', () => {
    const hugeString = 'a'.repeat(6 * 1024 * 1024); // 6 MB
    const parsed = parseImport(hugeString);
    expect(parsed.ok).toBe(false);
  });

  it('correctly merges states with newer updatedAt winning', () => {
    const current: AppState = {
      ...INITIAL_STATE,
      items: [
        {
          id: 'item_1',
          title: 'Old Title',
          description: '',
          categoryId: 'cat_travel',
          priority: 'low',
          tags: [],
          horizon: null,
          targetDate: null,
          status: 'pending',
          completedAt: null,
          reflection: '',
          checklist: [],
          budget: null,
          emoji: '✨',
          photos: [],
          order: 0,
          createdFrom: 'manual',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };

    const incoming: AppState = {
      ...INITIAL_STATE,
      items: [
        {
          id: 'item_1',
          title: 'Newer Title',
          description: '',
          categoryId: 'cat_travel',
          priority: 'high',
          tags: [],
          horizon: null,
          targetDate: null,
          status: 'pending',
          completedAt: null,
          reflection: '',
          checklist: [],
          budget: null,
          emoji: '✨',
          photos: [],
          order: 0,
          createdFrom: 'manual',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-02-01T00:00:00.000Z', // newer
        },
      ],
    };

    const merged = mergeStates(current, incoming);
    expect(merged.items.length).toBe(1);
    expect(merged.items[0]?.title).toBe('Newer Title');
    expect(merged.items[0]?.priority).toBe('high');
  });
});
