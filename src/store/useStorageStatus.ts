import { useAppStore } from './useAppStore';

export function useStorageStatus() {
  const status = useAppStore((s) => s.storageStatus);
  const corruptedRaw = useAppStore((s) => s.corruptedRaw);
  const setStatus = useAppStore((s) => s.setStorageStatus);

  return {
    status,
    corruptedRaw,
    isMemoryOnly: status === 'memory-only',
    isQuotaExceeded: status === 'quota',
    isRecovered: status === 'recovered',
    isReadOnly: status === 'readonly',
    dismissRecovered: () => setStatus('ok'),
  };
}
