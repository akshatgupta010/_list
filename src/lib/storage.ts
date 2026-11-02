import { AppState, INITIAL_STATE, StateSchema } from './schema';
import { runMigrations, CURRENT_SCHEMA_VERSION } from './migrations';

export const STORAGE_KEY = 'horizon:v1';
export const META_KEY = 'horizon:meta';

export type StorageStatus = 'ok' | 'memory-only' | 'quota' | 'recovered' | 'readonly';

export interface StorageResult {
  state: AppState;
  status: StorageStatus;
  corruptedRaw?: string;
}

export interface StorageMeta {
  lastExportDate: string | null;
  changeCountSinceExport: number;
}

/**
 * Checks if localStorage is functional in this browser context
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__horizon_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads and validates state from localStorage with corruption recovery
 */
export function loadState(): StorageResult {
  if (!isStorageAvailable()) {
    return { state: INITIAL_STATE, status: 'memory-only' };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { state: INITIAL_STATE, status: 'ok' };
  }

  try {
    const parsedJson = JSON.parse(raw);
    const migrationResult = runMigrations(parsedJson);

    if (migrationResult.status === 'newer_version') {
      return { state: migrationResult.data as AppState, status: 'readonly' };
    }

    if (migrationResult.status === 'invalid') {
      throw new Error('Schema validation failed');
    }

    return { state: migrationResult.data as AppState, status: 'ok' };
  } catch {
    // Preserve corrupted raw state under a recovery timestamp key
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:corrupt-${Date.now()}`, raw);
    } catch {
      // Ignore write failure if quota is exceeded
    }

    return {
      state: INITIAL_STATE,
      status: 'recovered',
      corruptedRaw: raw,
    };
  }
}

/**
 * Atomic write to localStorage with quota overflow handling
 */
export function saveState(state: AppState): 'ok' | 'quota' | 'unavailable' {
  if (!isStorageAvailable()) return 'unavailable';

  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return 'ok';
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      return 'quota';
    }
    return 'unavailable';
  }
}

/**
 * Metadata loader for backup reminders
 */
export function loadMeta(): StorageMeta {
  if (!isStorageAvailable()) return { lastExportDate: null, changeCountSinceExport: 0 };
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) return { lastExportDate: null, changeCountSinceExport: 0 };
    return JSON.parse(raw) as StorageMeta;
  } catch {
    return { lastExportDate: null, changeCountSinceExport: 0 };
  }
}

export function saveMeta(meta: StorageMeta): void {
  if (!isStorageAvailable()) return;
  try {
    window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch {
    // Ignore meta write errors
  }
}

/**
 * Generates an export payload and file download
 */
export function exportData(state: AppState): { jsonString: string; filename: string } {
  const dateStr = new Date().toISOString().split('T')[0]!;
  const payload = {
    app: 'HORIZON',
    exportedAt: new Date().toISOString(),
    ...state,
  };
  const jsonString = JSON.stringify(payload, null, 2);
  const filename = `horizon-backup-${dateStr}.json`;

  saveMeta({
    lastExportDate: new Date().toISOString(),
    changeCountSinceExport: 0,
  });

  return { jsonString, filename };
}

export function downloadJsonFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportPreview {
  itemsCount: number;
  categoriesCount: number;
  version: number;
  exportedAt?: string;
}

/**
 * Safe import parser: validates schema, checks size (<5MB), strips unknown properties
 */
export function parseImport(
  text: string,
  maxSizeInBytes = 5 * 1024 * 1024
): { ok: true; state: AppState; preview: ImportPreview } | { ok: false; error: string } {
  if (text.length > maxSizeInBytes) {
    return { ok: false, error: 'File exceeds the maximum allowed size (5 MB).' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'The provided file is not valid JSON.' };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Invalid data format.' };
  }

  const record = parsed as Record<string, unknown>;
  const version = typeof record.version === 'number' ? record.version : 1;
  if (version > CURRENT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Backup was created by a newer version (v${version}). Please update HORIZON.`,
    };
  }

  const migrationResult = runMigrations(parsed);
  if (migrationResult.status === 'invalid') {
    return { ok: false, error: 'File content does not match HORIZON schema.' };
  }

  const validated = StateSchema.safeParse(migrationResult.data);
  if (!validated.success) {
    return { ok: false, error: 'Validation failed on imported state.' };
  }

  const state = validated.data;
  return {
    ok: true,
    state,
    preview: {
      itemsCount: state.items.length,
      categoriesCount: state.categories.length,
      version: state.version,
      exportedAt: typeof record.exportedAt === 'string' ? record.exportedAt : undefined,
    },
  };
}

/**
 * Merges imported state into current state
 * Items: conflict matches by ID, newer updatedAt wins.
 * Categories: matches by ID; name collisions resolved by suffixing.
 */
export function mergeStates(current: AppState, incoming: AppState): AppState {
  const mergedItemsMap = new Map<string, typeof current.items[0]>();

  // Add existing items
  for (const item of current.items) {
    mergedItemsMap.set(item.id, item);
  }

  // Merge incoming items
  for (const item of incoming.items) {
    const existing = mergedItemsMap.get(item.id);
    if (!existing) {
      mergedItemsMap.set(item.id, item);
    } else {
      // Newer updatedAt wins
      if (new Date(item.updatedAt) >= new Date(existing.updatedAt)) {
        mergedItemsMap.set(item.id, item);
      }
    }
  }

  // Merge categories
  const categoriesMap = new Map<string, typeof current.categories[0]>();
  for (const cat of current.categories) {
    categoriesMap.set(cat.id, cat);
  }

  for (const cat of incoming.categories) {
    if (!categoriesMap.has(cat.id)) {
      // Check for name collisions
      let name = cat.name;
      const existingWithName = Array.from(categoriesMap.values()).some(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (existingWithName) {
        name = `${name} (Imported)`;
      }
      categoriesMap.set(cat.id, { ...cat, name });
    }
  }

  return {
    version: CURRENT_SCHEMA_VERSION,
    items: Array.from(mergedItemsMap.values()),
    categories: Array.from(categoriesMap.values()),
    settings: {
      ...current.settings,
      name: current.settings.name || incoming.settings.name,
      currency: current.settings.currency || incoming.settings.currency,
    },
  };
}

/**
 * Estimates storage usage in bytes (UTF-16 encoding: 2 bytes per char)
 */
export function estimateStorageUsage(state: AppState): {
  bytesUsed: number;
  percentage: number;
  isNearLimit: boolean;
} {
  const MAX_STORAGE_BYTES = 5 * 1024 * 1024; // 5 MB
  const serialized = JSON.stringify(state);
  const bytesUsed = serialized.length * 2;
  const percentage = Math.min(100, Math.round((bytesUsed / MAX_STORAGE_BYTES) * 100));
  const isNearLimit = percentage >= 80;

  return { bytesUsed, percentage, isNearLimit };
}
