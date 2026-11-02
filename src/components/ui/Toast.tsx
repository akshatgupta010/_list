import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button } from './Button';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  durationMs?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      type = 'info',
      title,
      description,
      action,
      durationMs = 5000,
    }: Omit<ToastMessage, 'id'>) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, description, action, durationMs };

      setToasts((prev) => [...prev, newToast]);

      if (durationMs > 0) {
        setTimeout(() => {
          dismiss(id);
        }, durationMs);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      {/* Toast Region with aria-live for screen readers */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto glass-panel corner-brackets border border-line rounded-card p-4 shadow-xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle className="w-4 h-4 text-success" />}
              {t.type === 'error' && <AlertCircle className="w-4 h-4 text-danger" />}
              {t.type === 'info' && <Info className="w-4 h-4 text-accent" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink">{t.title}</p>
              {t.description && (
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{t.description}</p>
              )}
              {t.action && (
                <div className="mt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      t.action?.onClick();
                      dismiss(t.id);
                    }}
                    className="text-xs py-1 px-2.5 font-mono"
                  >
                    {t.action.label}
                  </Button>
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="text-muted hover:text-ink p-1 shrink-0 rounded"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
