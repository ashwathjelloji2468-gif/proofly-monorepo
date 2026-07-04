'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

/**
 * Global React Error Boundary
 * Catches all unhandled React render errors and shows a graceful UI.
 * Reports errors to the monitoring endpoint in production.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now().toString(36)}`,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info);

    // Report to monitoring in production (fire and forget)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          name: error.name,
          url: window.location.href,
          userAgent: navigator.userAgent,
          errorId: this.state.errorId,
          componentStack: info.componentStack?.slice(0, 500),
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {/* silent — monitoring should never break the app */});
    }

    // Always log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorId: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return <>{this.props.fallback}</>;

      return (
        <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-900/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                An unexpected error occurred. Our team has been notified.
              </p>
              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <pre className="mt-3 text-left bg-[#18181B] border border-border-primary rounded-lg p-3 text-red-400 text-[10px] overflow-auto max-h-32 leading-relaxed">
                  {this.state.error.message}
                </pre>
              )}
            </div>

            {/* Error ID */}
            <p className="text-[10px] text-slate-600">
              Error reference: <span className="font-mono text-slate-500">{this.state.errorId}</span>
            </p>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#18181B] border border-border-primary text-slate-300 hover:text-white hover:border-slate-600 rounded-lg text-xs font-semibold transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-emerald to-brand-teal text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
              >
                <Home className="w-3.5 h-3.5" />
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
