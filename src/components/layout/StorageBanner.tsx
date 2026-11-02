import { AlertTriangle, Download, HardDriveDownload, X } from 'lucide-react';
import { useStorageStatus } from '@/store/useStorageStatus';
import { useAppStore } from '@/store/useAppStore';
import { exportData, downloadJsonFile } from '@/lib/storage';
import { Button } from '@/components/ui/Button';

export function StorageBanner() {
  const {
    isMemoryOnly,
    isQuotaExceeded,
    isRecovered,
    isReadOnly,
    corruptedRaw,
    dismissRecovered,
  } = useStorageStatus();

  const storeState = useAppStore();

  if (!isMemoryOnly && !isQuotaExceeded && !isRecovered && !isReadOnly) {
    return null;
  }

  const handleExportBackup = () => {
    const { jsonString, filename } = exportData({
      version: storeState.version,
      items: storeState.items,
      categories: storeState.categories,
      settings: storeState.settings,
    });
    downloadJsonFile(jsonString, filename);
  };

  const handleDownloadCorrupted = () => {
    if (!corruptedRaw) return;
    downloadJsonFile(corruptedRaw, `horizon-corrupted-${Date.now()}.json`);
  };

  return (
    <div
      role="alert"
      className="bg-warning-bg/90 border-b border-warning text-ink px-4 py-2.5 text-xs font-mono relative z-30 flex flex-wrap items-center justify-between gap-3 shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 max-w-2xl">
        <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
        <div>
          {isMemoryOnly && (
            <span>
              <strong>Storage Unavailable:</strong> Browser storage is blocked (e.g. private mode). Changes will vanish upon tab close.
            </span>
          )}
          {isQuotaExceeded && (
            <span>
              <strong>Storage Quota Reached:</strong> Browser storage is full. Please export your backup and remove large goals.
            </span>
          )}
          {isRecovered && (
            <span>
              <strong>Corrupted Data Recovered:</strong> Unreadable data was detected. A fresh session was initialized and raw data was backed up.
            </span>
          )}
          {isReadOnly && (
            <span>
              <strong>Read-Only Mode:</strong> Stored data was created by a newer version of HORIZON.
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportBackup}
          className="text-xs py-1 px-2.5 gap-1.5 h-7"
        >
          <Download className="w-3.5 h-3.5" />
          Export Data
        </Button>

        {isRecovered && corruptedRaw && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCorrupted}
            className="text-xs py-1 px-2.5 gap-1.5 h-7"
          >
            <HardDriveDownload className="w-3.5 h-3.5" />
            Download Corrupt Raw
          </Button>
        )}

        {isRecovered && (
          <button
            onClick={dismissRecovered}
            className="text-muted hover:text-ink p-1 rounded"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
