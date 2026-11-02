import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  exportData,
  downloadJsonFile,
  parseImport,
  estimateStorageUsage,
  ImportPreview,
} from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { AppState } from '@/lib/schema';

export function SettingsPage() {
  const { toast } = useToast();

  const settings = useAppStore((s) => s.settings);
  const items = useAppStore((s) => s.items);
  const categories = useAppStore((s) => s.categories);
  const version = useAppStore((s) => s.version);

  const updateSettings = useAppStore((s) => s.updateSettings);
  const importState = useAppStore((s) => s.importState);
  const resetAll = useAppStore((s) => s.resetAll);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage meter calculation
  const storageUsage = estimateStorageUsage({
    version,
    items,
    categories,
    settings,
  });

  // Import flow state
  const [importPendingState, setImportPendingState] = useState<AppState | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  // Reset modal state
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetConfirmInput, setResetConfirmInput] = useState('');

  // Handle Export
  const handleExport = () => {
    const { jsonString, filename } = exportData({
      version,
      items,
      categories,
      settings,
    });
    downloadJsonFile(jsonString, filename);
    toast({
      title: 'Export Complete',
      description: `Downloaded ${filename} successfully.`,
    });
  };

  // Handle Import File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = parseImport(text);
      if (result.ok) {
        setImportPendingState(result.state);
        setImportPreview(result.preview);
      } else {
        toast({
          type: 'error',
          title: 'Import Failed',
          description: result.error,
        });
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be selected again
    e.target.value = '';
  };

  const handleExecuteImport = (mode: 'replace' | 'merge') => {
    if (!importPendingState) return;

    importState(importPendingState, mode);
    toast({
      title: 'Import Successful',
      description: `Restored goals and categories in "${mode}" mode.`,
    });
    setImportPendingState(null);
    setImportPreview(null);
  };

  const handleExecuteReset = () => {
    if (resetConfirmInput !== 'DELETE') return;
    resetAll();
    toast({
      title: 'Data Reset',
      description: 'All goals have been cleared. Default categories restored.',
    });
    setIsResetOpen(false);
    setResetConfirmInput('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink tracking-tight">
          Application Settings
        </h1>
        <p className="text-xs font-mono text-muted uppercase tracking-wider mt-0.5">
          Appearance, preferences & data safeguards
        </p>
      </div>

      {/* Profile & Name */}
      <section className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-4">
        <h2 className="text-base font-display font-semibold text-ink">Personal Profile</h2>
        <Input
          label="Display Name / Moniker"
          placeholder="e.g. Alex"
          value={settings.name}
          onChange={(e) => updateSettings({ name: e.target.value })}
          maxLength={30}
          hint="Shown on your home dashboard greeting."
        />
      </section>

      {/* Appearance & Themes */}
      <section className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-4">
        <h2 className="text-base font-display font-semibold text-ink">Interface Preferences</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Visual Theme"
            value={settings.theme}
            onChange={(e) =>
              updateSettings({
                theme: e.target.value as 'system' | 'light' | 'dark',
              })
            }
            options={[
              { value: 'system', label: 'System Automatic' },
              { value: 'light', label: 'Pearl Chrome (Light)' },
              { value: 'dark', label: 'Obsidian Chrome (Dark)' },
            ]}
          />

          <Select
            label="Default View Mode"
            value={settings.viewMode}
            onChange={(e) =>
              updateSettings({ viewMode: e.target.value as 'grid' | 'list' })
            }
            options={[
              { value: 'grid', label: 'Grid of Cards' },
              { value: 'list', label: 'Compact List Rows' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Budget Currency"
            value={settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
            options={[
              { value: 'INR', label: 'INR (₹) - Indian Rupee' },
              { value: 'USD', label: 'USD ($) - US Dollar' },
              { value: 'EUR', label: 'EUR (€) - Euro' },
              { value: 'GBP', label: 'GBP (£) - British Pound' },
              { value: 'JPY', label: 'JPY (¥) - Japanese Yen' },
              { value: 'CAD', label: 'CAD ($) - Canadian Dollar' },
              { value: 'AUD', label: 'AUD ($) - Australian Dollar' },
            ]}
          />

          <Select
            label="Reduced Motion"
            value={settings.reduceMotion}
            onChange={(e) =>
              updateSettings({
                reduceMotion: e.target.value as 'system' | 'on' | 'off',
              })
            }
            options={[
              { value: 'system', label: 'Follow OS Setting' },
              { value: 'on', label: 'Always Reduce (No Confetti / Glitch)' },
              { value: 'off', label: 'Animations Enabled' },
            ]}
          />
        </div>
      </section>

      {/* Storage Health & Meter */}
      <section className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-accent" />
            <h2 className="text-base font-display font-semibold text-ink">
              Browser Storage Usage
            </h2>
          </div>
          <span className="text-xs font-mono text-muted">
            {(storageUsage.bytesUsed / 1024).toFixed(1)} KB / 5 MB
          </span>
        </div>

        <ProgressBar
          value={storageUsage.percentage}
          label="LocalStorage Capacity"
          size="sm"
        />

        {storageUsage.isNearLimit && (
          <div className="flex items-center gap-2 text-xs text-danger font-mono bg-danger/10 p-2.5 rounded-control">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Storage is approaching capacity limit. Export backup to preserve data.</span>
          </div>
        )}
      </section>

      {/* Data Backup & Portability */}
      <section className="glass-panel corner-brackets rounded-card border border-line p-6 space-y-5">
        <div>
          <h2 className="text-base font-display font-semibold text-ink">Data Safeguards</h2>
          <p className="text-xs text-muted mt-0.5">
            HORIZON never sends your data over any network. Export your JSON file to keep an
            independent backup or transfer across computers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button variant="chrome" onClick={handleExport} className="font-mono text-xs uppercase tracking-wider flex-1">
            <Download className="w-4 h-4 mr-1.5" />
            Export JSON Backup
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="font-mono text-xs uppercase tracking-wider flex-1"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Import from JSON
          </Button>
        </div>

        {/* Danger Zone: Reset All Data */}
        <div className="pt-4 border-t border-line/60 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-danger font-semibold">
              Danger Zone
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Permanently wipe all goals, subtasks and memories on this browser.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetOpen(true)}
            className="font-mono text-xs uppercase shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Reset All
          </Button>
        </div>
      </section>

      {/* About & Security Disclosure */}
      <section className="p-4 rounded-card bg-surface2/40 border border-line/40 text-xs font-mono text-muted space-y-2">
        <div className="flex items-center gap-1.5 text-ink font-semibold">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>HORIZON Privacy Architecture (v{version}.0)</span>
        </div>
        <p className="leading-relaxed">
          All records, reflections, and subtasks are held strictly in client-side HTML5 localStorage.
          No third-party trackers, telemetry, or remote servers receive your information.
        </p>
      </section>

      {/* Import Preview Modal */}
      <Dialog
        isOpen={Boolean(importPreview)}
        onClose={() => {
          setImportPendingState(null);
          setImportPreview(null);
        }}
        title="Confirm Backup Import"
        description="Review the incoming data before updating your browser state."
      >
        {importPreview && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-control bg-surface2 border border-line text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-muted">Goals Found:</span>
                <span className="text-ink font-bold">{importPreview.itemsCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Categories:</span>
                <span className="text-ink font-bold">{importPreview.categoriesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Schema Version:</span>
                <span className="text-ink">v{importPreview.version}</span>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Choose <strong>Merge</strong> to blend incoming goals with your existing ones, or{' '}
              <strong>Replace</strong> to overwrite current state entirely.
            </p>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-line/60">
              <Button
                variant="ghost"
                onClick={() => {
                  setImportPendingState(null);
                  setImportPreview(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="secondary" onClick={() => handleExecuteImport('merge')}>
                Merge Data
              </Button>
              <Button variant="danger" onClick={() => handleExecuteImport('replace')}>
                Replace All
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="Wipe All Data?"
        description="This will permanently delete all bucket list items, milestones, and custom categories. This action cannot be undone."
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted">
              Type <strong className="text-danger">DELETE</strong> to confirm:
            </label>
            <Input
              value={resetConfirmInput}
              onChange={(e) => setResetConfirmInput(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line/60">
            <Button variant="ghost" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={resetConfirmInput !== 'DELETE'}
              onClick={handleExecuteReset}
            >
              Confirm Wipe
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
