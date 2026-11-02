import { AppState, INITIAL_STATE, StateSchema } from './schema';

export const CURRENT_SCHEMA_VERSION = 1;

export interface Migration {
  fromVersion: number;
  toVersion: number;
  migrate: (data: unknown) => unknown;
}

export const migrations: Migration[] = [];

/**
 * Runs sequential migrations on imported or loaded data
 */
export function runMigrations(rawData: unknown): {
  data: unknown;
  status: 'ok' | 'migrated' | 'newer_version' | 'invalid';
} {
  if (!rawData || typeof rawData !== 'object') {
    return { data: INITIAL_STATE, status: 'invalid' };
  }

  const record = rawData as Record<string, unknown>;
  const version = typeof record.version === 'number' ? record.version : 1;

  if (version > CURRENT_SCHEMA_VERSION) {
    return { data: rawData, status: 'newer_version' };
  }

  let currentData: unknown = rawData;
  let hasMigrated = false;

  for (const m of migrations) {
    const curVer = (currentData as Record<string, unknown>).version as number;
    if (curVer === m.fromVersion) {
      currentData = m.migrate(currentData);
      hasMigrated = true;
    }
  }

  const parsed = StateSchema.safeParse(currentData);
  if (!parsed.success) {
    return { data: currentData, status: 'invalid' };
  }

  return {
    data: parsed.data as AppState,
    status: hasMigrated ? 'migrated' : 'ok',
  };
}
