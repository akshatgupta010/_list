import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomTabs } from './BottomTabs';
import { ArtBackdrop } from './ArtBackdrop';
import { StorageBanner } from './StorageBanner';
import { Button } from '@/components/ui/Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg text-ink flex items-center justify-center p-6 text-center">
          <div className="glass-panel corner-brackets rounded-card border border-line p-8 max-w-md w-full space-y-4">
            <h2 className="text-xl font-display font-bold">System Anomaly Detected</h2>
            <p className="text-sm text-muted">
              An unexpected render error occurred. Your stored goals remain safe in your browser.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="chrome"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.hash = '#/';
                  window.location.reload();
                }}
              >
                Reload Horizon
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function RootLayout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col relative selection:bg-line/80 selection:text-ink">
        <ArtBackdrop />
        <StorageBanner />
        <Header />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <Outlet />
        </main>

        <Footer />
        <BottomTabs />
      </div>
    </ErrorBoundary>
  );
}
