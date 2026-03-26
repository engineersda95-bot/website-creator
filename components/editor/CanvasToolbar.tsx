'use client';

import React from 'react';
import { 
  Monitor, Tablet, Smartphone, RotateCcw, RotateCw, 
  ZoomOut, ZoomIn, Minimize, Maximize, HelpCircle, Settings, Moon, Sun 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CanvasToolbarProps {
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  zoom: number;
  setZoom: (z: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  ZOOM_STEPS: number[];
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  setLeftSidebarCollapsed: (v: boolean) => void;
  setRightSidebarCollapsed: (v: boolean) => void;
  setIsHelpOpen: (v: boolean) => void;
  selectedBlockId: string | null;
  selectBlock: (id: string | null) => void;
  isDark: boolean;
  updateProjectSettings: (settings: any) => void;
}

export function CanvasToolbar({
  viewport,
  setViewport,
  undo,
  redo,
  historyIndex,
  historyLength,
  zoom,
  setZoom,
  zoomIn,
  zoomOut,
  ZOOM_STEPS,
  leftSidebarCollapsed,
  rightSidebarCollapsed,
  setLeftSidebarCollapsed,
  setRightSidebarCollapsed,
  setIsHelpOpen,
  selectedBlockId,
  selectBlock,
  isDark,
  updateProjectSettings
}: CanvasToolbarProps) {
  return (
    <div className="h-11 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 shrink-0 z-20">
      {/* Left: viewport + undo/redo */}
      <div className="flex items-center gap-3">
        {/* Segmented viewport control */}
        <div data-tour="viewport-switcher" className="flex items-center bg-zinc-100 rounded-lg p-0.5">
          {([
            { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
            { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
            { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
          ]).map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                viewport === key
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
              title={label}
            >
              <Icon size={14} />
              <span className="hidden lg:inline text-[11px]">{label}</span>
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-zinc-200" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5" data-tour="undo-redo">
          <button
            onClick={() => undo()}
            disabled={historyIndex <= 0}
            className={cn("p-1.5 rounded-md transition-all", historyIndex > 0 ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900" : "text-zinc-200 cursor-not-allowed")}
            title="Annulla (Ctrl+Z)"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => redo()}
            disabled={historyIndex >= historyLength - 1}
            className={cn("p-1.5 rounded-md transition-all", historyIndex < historyLength - 1 ? "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900" : "text-zinc-200 cursor-not-allowed")}
            title="Ripristina (Ctrl+Y)"
          >
            <RotateCw size={15} />
          </button>
        </div>

        <div className="h-5 w-px bg-zinc-200" />

        {/* Zoom */}
        <div className="flex items-center gap-0.5 bg-zinc-100 rounded-lg p-0.5" data-tour="zoom-controls">
          <button
            onClick={zoomOut}
            disabled={zoom <= ZOOM_STEPS[0]}
            className={cn("p-1.5 rounded-md transition-all", zoom > ZOOM_STEPS[0] ? "text-zinc-600 hover:bg-white" : "text-zinc-200 cursor-not-allowed")}
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={() => setZoom(100)}
            className="px-1.5 py-0.5 rounded text-[11px] font-bold text-zinc-900 hover:bg-white transition-all min-w-[3rem] text-center tabular-nums"
            title="Reset zoom"
          >
            {zoom}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom >= ZOOM_STEPS[ZOOM_STEPS.length - 1]}
            className={cn("p-1.5 rounded-md transition-all", zoom < ZOOM_STEPS[ZOOM_STEPS.length - 1] ? "text-zinc-600 hover:bg-white" : "text-zinc-200 cursor-not-allowed")}
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>

      {/* Right: tools */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            const hide = !leftSidebarCollapsed || !rightSidebarCollapsed;
            setLeftSidebarCollapsed(hide);
            setRightSidebarCollapsed(hide);
          }}
          className={cn(
            "p-1.5 rounded-md transition-all",
            (leftSidebarCollapsed && rightSidebarCollapsed) ? "text-blue-600 bg-blue-50" : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          )}
          title={(leftSidebarCollapsed && rightSidebarCollapsed) ? "Esci da Focus Mode" : "Focus Mode (Nascondi Barre)"}
        >
          {(leftSidebarCollapsed && rightSidebarCollapsed) ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>

        <button
          onClick={() => setIsHelpOpen(true)}
          className="p-1.5 rounded-md text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
          title="Guida / Aiuto"
          data-tour="help-btn"
        >
          <HelpCircle size={16} />
        </button>

        {selectedBlockId !== null && (
          <button
            onClick={() => selectBlock(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            title="Torna agli stili globali"
          >
            <Settings size={14} />
            <span className="hidden lg:inline">Stili globali</span>
          </button>
        )}

        <div className="h-5 w-px bg-zinc-200" />

        <button
          onClick={() => updateProjectSettings({ appearance: isDark ? 'light' : 'dark' })}
          className={cn(
            "p-1.5 rounded-md transition-all",
            isDark ? "text-amber-500 hover:bg-amber-50" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          )}
          title={isDark ? 'Passa a tema chiaro' : 'Passa a tema scuro'}
          data-tour="theme-toggle"
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>
    </div>
  );
}
