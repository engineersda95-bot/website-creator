'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

let showConfirmFn: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

export function confirm(options: ConfirmOptions | string): Promise<boolean> {
  const opts = typeof options === 'string' ? { message: options } : options;
  if (!showConfirmFn) return Promise.resolve(window.confirm(opts.message));
  return showConfirmFn(opts);
}

export const ConfirmDialogContainer: React.FC = () => {
  const [state, setState] = useState<ConfirmState | null>(null);
  const [leaving, setLeaving] = useState(false);

  const show = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, resolve });
      setLeaving(false);
    });
  }, []);

  useEffect(() => {
    showConfirmFn = show;
    return () => { showConfirmFn = null; };
  }, [show]);

  const handleClose = (result: boolean) => {
    setLeaving(true);
    setTimeout(() => {
      state?.resolve(result);
      setState(null);
      setLeaving(false);
    }, 150);
  };

  if (!state) return null;

  const isDanger = state.variant === 'danger';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-150",
          leaving ? "opacity-0" : "opacity-100"
        )}
        onClick={() => handleClose(false)}
      />
      <div
        className={cn(
          "relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-150",
          leaving ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-in zoom-in-95 fade-in"
        )}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isDanger ? "bg-red-50" : "bg-zinc-100"
            )}>
              <AlertTriangle size={18} className={isDanger ? "text-red-500" : "text-zinc-500"} />
            </div>
            <div className="min-w-0 pt-0.5">
              {state.title && (
                <h3 className="text-sm font-bold text-zinc-900 mb-1">{state.title}</h3>
              )}
              <p className="text-sm text-zinc-500 leading-relaxed">{state.message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2 justify-end">
          <button
            onClick={() => handleClose(false)}
            className="px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 rounded-lg transition-colors"
          >
            {state.cancelLabel || 'Annulla'}
          </button>
          <button
            onClick={() => handleClose(true)}
            className={cn(
              "px-4 py-2 text-sm font-semibold rounded-lg transition-all",
              isDanger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-zinc-900 text-white hover:bg-zinc-800"
            )}
          >
            {state.confirmLabel || 'Conferma'}
          </button>
        </div>
      </div>
    </div>
  );
};
