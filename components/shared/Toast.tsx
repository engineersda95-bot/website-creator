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

  const variants = {
    success: {
      wrapper: 'bg-emerald-600 border-emerald-700',
      icon: <CheckCircle size={16} className="text-white shrink-0" />,
      text: 'text-white',
      close: 'text-emerald-200 hover:text-white',
    },
    error: {
      wrapper: 'bg-red-600 border-red-700',
      icon: <AlertCircle size={16} className="text-white shrink-0" />,
      text: 'text-white',
      close: 'text-red-200 hover:text-white',
    },
    info: {
      wrapper: 'bg-zinc-900 border-zinc-700',
      icon: <Info size={16} className="text-zinc-300 shrink-0" />,
      text: 'text-white',
      close: 'text-zinc-400 hover:text-white',
    },
  };

  const v = variants[t.type];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3 px-4 py-3 border rounded-xl shadow-xl max-w-sm transition-all duration-200",
        v.wrapper,
        leaving ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0 animate-in slide-in-from-right-4 fade-in"
      )}
    >
      {v.icon}
      <p className={cn("text-sm font-medium flex-1", v.text)}>{t.message}</p>
      <button
        onClick={() => setLeaving(true)}
        className={cn("p-0.5 transition-colors shrink-0", v.close)}
      >
        <X size={14} />
      </button>
    </div>
  );
}
