'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let addToastFn: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export function toast(message: string, type: ToastType = 'info', duration = 3000) {
  addToastFn?.({ message, type, duration });
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
};

function ToastItem({ toast: t, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLeaving(true), t.duration || 3000);
    return () => clearTimeout(timer);
  }, [t.duration]);

  useEffect(() => {
    if (leaving) {
      const timer = setTimeout(() => onRemove(t.id), 200);
      return () => clearTimeout(timer);
    }
  }, [leaving, onRemove, t.id]);

  const icons = {
    success: <CheckCircle size={16} className="text-emerald-500 shrink-0" />,
    error: <AlertCircle size={16} className="text-red-500 shrink-0" />,
    info: <Info size={16} className="text-blue-500 shrink-0" />,
  };

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white border border-zinc-200 rounded-xl shadow-lg max-w-sm transition-all duration-200",
        leaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0 animate-in slide-in-from-right-4 fade-in"
      )}
    >
      {icons[t.type]}
      <p className="text-sm text-zinc-700 flex-1">{t.message}</p>
      <button
        onClick={() => setLeaving(true)}
        className="p-0.5 text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
