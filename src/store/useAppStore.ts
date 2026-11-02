import { create } from 'zustand';
import {
  AppState,
  Item,
  Category,
  Settings,
  INITIAL_STATE,
  Priority,
} from '../lib/schema';
import {
  loadState,
  saveState,
  StorageStatus,
  mergeStates,
} from '../lib/storage';
import { generateId } from '../lib/id';

export interface CreateItemInput {
  title: string;
  description?: string;
  categoryId: string;
  priority?: Priority;
  targetDate?: string | null;
  emoji?: string;
  tags?: string[];
  horizon?: string | null;
  budget?: { estimated: number; saved: number } | null;
}

export interface AppStoreState extends AppState {
  storageStatus: StorageStatus;
  corruptedRaw?: string;
  recentlyDeletedItem: Item | null;

  // Actions
  addItem: (input: CreateItemInput) => Item;
  updateItem: (id: string, updates: Partial<Omit<Item, 'id' | 'createdAt'>>) => void;
  deleteItem: (id: string) => Item | null;
  restoreItem: (item: Item) => void;
  clearRecentlyDeleted: () => void;
  completeItem: (id: string, options?: { completedAt?: string | null; reflection?: string }) => void;
  uncompleteItem: (id: string, keepReflection?: boolean) => void;
  toggleChecklistItem: (itemId: string, checklistId: string) => void;
  addChecklistItem: (itemId: string, text: string) => void;
  deleteChecklistItem: (itemId: string, checklistId: string) => void;

  addCategory: (name: string) => Category | null;
  renameCategory: (id: string, name: string) => boolean;
  deleteCategory: (id: string) => boolean;

  updateSettings: (partial: Partial<Settings>) => void;
  importState: (incomingState: AppState, mode: 'replace' | 'merge') => void;
  resetAll: () => void;
  setStorageStatus: (status: StorageStatus) => void;
}

// Initialize from storage safely
const initialLoaded = loadState();

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedPersist(state: AppState, setStatus: (s: StorageStatus) => void) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    const status = saveState(state);
    if (status === 'quota') setStatus('quota');
    else if (status === 'unavailable') setStatus('memory-only');
  }, 300);
}

// Immediate flush on page hide/visibility change
function flushSave(state: AppState) {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  saveState(state);
}

export const useAppStore = create<AppStoreState>((set, get) => {
  // Setup flush listener for document hide
  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        const { version, items, categories, settings } = get();
        flushSave({ version, items, categories, settings });
      }
    });
    window.addEventListener('pagehide', () => {
      const { version, items, categories, settings } = get();
      flushSave({ version, items, categories, settings });
    });

    // Cross-tab sync listener
    window.addEventListener('storage', (event) => {
      if (event.key === 'horizon:v1' && event.newValue) {
        try {
          const fresh = JSON.parse(event.newValue) as AppState;
          set({
            version: fresh.version,
            items: fresh.items,
            categories: fresh.categories,
            settings: fresh.settings,
          });
        } catch {
          // ignore parsing error from other tab
        }
      }
    });
  }

  const syncAndSave = (nextState: Partial<AppState>) => {
    set(nextState as Partial<AppStoreState>);
    const state = get();
    debouncedPersist(
      {
        version: state.version,
        items: state.items,
        categories: state.categories,
        settings: state.settings,
      },
      (s) => set({ storageStatus: s })
    );
  };

  return {
    version: initialLoaded.state.version,
    items: initialLoaded.state.items,
    categories: initialLoaded.state.categories,
    settings: initialLoaded.state.settings,
    storageStatus: initialLoaded.status,
    corruptedRaw: initialLoaded.corruptedRaw,
    recentlyDeletedItem: null,

    addItem: (input) => {
      const now = new Date().toISOString();
      const newItem: Item = {
        id: generateId(),
        title: input.title.trim(),
        description: (input.description || '').trim(),
        categoryId: input.categoryId,
        priority: input.priority || 'medium',
        tags: input.tags || [],
        horizon: input.horizon || null,
        targetDate: input.targetDate || null,
        status: 'pending',
        completedAt: null,
        reflection: '',
        checklist: [],
        budget: input.budget || null,
        emoji: input.emoji || '✨',
        photos: [],
        order: get().items.length,
        createdFrom: 'manual',
        createdAt: now,
        updatedAt: now,
      };

      syncAndSave({ items: [newItem, ...get().items] });
      return newItem;
    },

    updateItem: (id, updates) => {
      const now = new Date().toISOString();
      const updated = get().items.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: now } : item
      );
      syncAndSave({ items: updated });
    },

    deleteItem: (id) => {
      const itemToDelete = get().items.find((i) => i.id === id) || null;
      if (!itemToDelete) return null;

      const remaining = get().items.filter((i) => i.id !== id);
      set({ recentlyDeletedItem: itemToDelete });
      syncAndSave({ items: remaining });
      return itemToDelete;
    },

    restoreItem: (item) => {
      syncAndSave({
        items: [item, ...get().items],
      });
      set({ recentlyDeletedItem: null });
    },

    clearRecentlyDeleted: () => {
      set({ recentlyDeletedItem: null });
    },

    completeItem: (id, options) => {
      const now = new Date().toISOString();
      const completedAt = options?.completedAt || now;
      const reflection = options?.reflection || '';

      const updated = get().items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'completed' as const,
              completedAt,
              reflection: reflection || item.reflection,
              updatedAt: now,
            }
          : item
      );
      syncAndSave({ items: updated });
    },

    uncompleteItem: (id, keepReflection = true) => {
      const now = new Date().toISOString();
      const updated = get().items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'pending' as const,
              completedAt: null,
              reflection: keepReflection ? item.reflection : '',
              updatedAt: now,
            }
          : item
      );
      syncAndSave({ items: updated });
    },

    toggleChecklistItem: (itemId, checklistId) => {
      const now = new Date().toISOString();
      const updated = get().items.map((item) => {
        if (item.id !== itemId) return item;
        const newChecklist = item.checklist.map((c) =>
          c.id === checklistId ? { ...c, done: !c.done } : c
        );
        return { ...item, checklist: newChecklist, updatedAt: now };
      });
      syncAndSave({ items: updated });
    },

    addChecklistItem: (itemId, text) => {
      const now = new Date().toISOString();
      const updated = get().items.map((item) => {
        if (item.id !== itemId) return item;
        const newChecklist = [
          ...item.checklist,
          { id: generateId(), text: text.trim(), done: false },
        ];
        return { ...item, checklist: newChecklist, updatedAt: now };
      });
      syncAndSave({ items: updated });
    },

    deleteChecklistItem: (itemId, checklistId) => {
      const now = new Date().toISOString();
      const updated = get().items.map((item) => {
        if (item.id !== itemId) return item;
        const newChecklist = item.checklist.filter((c) => c.id !== checklistId);
        return { ...item, checklist: newChecklist, updatedAt: now };
      });
      syncAndSave({ items: updated });
    },

    addCategory: (name) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const existing = get().categories.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (existing) return null;
      if (get().categories.length >= 20) return null;

      const newCat: Category = {
        id: 'cat_' + generateId().slice(0, 8),
        name: trimmed,
        isDefault: false,
      };
      syncAndSave({ categories: [...get().categories, newCat] });
      return newCat;
    },

    renameCategory: (id, name) => {
      const trimmed = name.trim();
      if (!trimmed) return false;
      const updated = get().categories.map((c) =>
        c.id === id ? { ...c, name: trimmed } : c
      );
      syncAndSave({ categories: updated });
      return true;
    },

    deleteCategory: (id) => {
      const cat = get().categories.find((c) => c.id === id);
      if (!cat || cat.isDefault) return false; // Default categories cannot be deleted

      // Reassign goals to 'cat_other'
      const updatedItems = get().items.map((item) =>
        item.categoryId === id ? { ...item, categoryId: 'cat_other' } : item
      );
      const remainingCats = get().categories.filter((c) => c.id !== id);

      syncAndSave({
        categories: remainingCats,
        items: updatedItems,
      });
      return true;
    },

    updateSettings: (partial) => {
      const updated = { ...get().settings, ...partial };
      // Apply theme to document
      if (typeof document !== 'undefined' && partial.theme) {
        const isDark =
          partial.theme === 'dark' ||
          (partial.theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
        if (isDark) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }
      syncAndSave({ settings: updated });
    },

    importState: (incomingState, mode) => {
      if (mode === 'replace') {
        syncAndSave({
          version: incomingState.version,
          items: incomingState.items,
          categories: incomingState.categories,
          settings: incomingState.settings,
        });
      } else {
        const current: AppState = {
          version: get().version,
          items: get().items,
          categories: get().categories,
          settings: get().settings,
        };
        const merged = mergeStates(current, incomingState);
        syncAndSave(merged);
      }
    },

    resetAll: () => {
      syncAndSave({
        items: [],
        categories: INITIAL_STATE.categories,
        settings: INITIAL_STATE.settings,
      });
    },

    setStorageStatus: (status) => set({ storageStatus: status }),
  };
});
