'use client';

import React, { useMemo, useState } from 'react';
import { X, CheckCircle2, Circle, AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CheckResult,
  runGlobalChecks,
  runPageChecks,
  getCompletionScore,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '@/lib/site-checklist';
import { Project, Page } from '@/types/editor';

interface ChecklistModalProps {
  project: Project;
  pages: Page[];
  onClose: () => void;
  initialPageId?: string;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({ project, pages, onClose, initialPageId }) => {
  const [activePageId, setActivePageId] = useState<string | null>(initialPageId || null);

  const globalResults = useMemo(() => runGlobalChecks(project, pages), [project, pages]);
  const globalScore = getCompletionScore(globalResults);

  const pageScores = useMemo(() =>
    pages.map(page => ({
      page,
      results: runPageChecks(project, pages, page),
      score: getCompletionScore(runPageChecks(project, pages, page)),
    })),
    [project, pages]
  );

  const activePageData = activePageId ? pageScores.find(p => p.page.id === activePageId) : null;

  const renderResults = (results: CheckResult[]) => {
    const grouped: Record<string, CheckResult[]> = {};
    for (const r of results) {
      const cat = r.item.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(r);
    }

    return Object.entries(grouped).map(([category, items]) => {
      const passed = items.filter(r => r.passed).length;
      const total = items.length;

      return (
        <div key={category} className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", CATEGORY_COLORS[category])}>
              {CATEGORY_LABELS[category]}
            </span>
            <span className="text-[10px] text-zinc-400">{passed}/{total}</span>
          </div>
          {items.map(({ item, passed: ok }) => (
            <div key={item.id} className={cn("flex items-start gap-2.5 px-3 py-2 rounded-lg", ok ? "opacity-50" : "bg-zinc-50")}>
              {ok ? (
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className={cn("text-[12px] font-medium", ok ? "text-zinc-400 line-through" : "text-zinc-700")}>
                  {item.label}
                </div>
                {!ok && <div className="text-[10px] text-zinc-400 mt-0.5">{item.description}</div>}
              </div>
            </div>
          ))}
        </div>
      );
    });
  };

  const ScoreRing: React.FC<{ score: number; size?: number }> = ({ score, size = 48 }) => {
    const color = score === 100 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#e4e4e7" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${score * 0.94} 94`} strokeLinecap="round" className="transition-all duration-500" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-zinc-700">{score}%</span>
      </div>
    );
  };

  // Single page mode — only show checks for one page
  const singlePage = initialPageId ? pages.find(p => p.id === initialPageId) : null;
  const singlePageResults = singlePage ? runPageChecks(project, pages, singlePage) : null;
  const singlePageScore = singlePageResults ? getCompletionScore(singlePageResults) : 0;

  if (singlePage && singlePageResults) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-lg max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
            <div className="flex items-center gap-4">
              <ScoreRing score={singlePageScore} size={42} />
              <div>
                <h2 className="text-sm font-bold text-zinc-900">{singlePage.title || singlePage.slug}</h2>
                <p className="text-[11px] text-zinc-400">
                  {singlePageScore === 100 ? 'Pagina completa!' : `${singlePageResults.filter(r => r.passed).length}/${singlePageResults.length} completati`}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
            {renderResults(singlePageResults)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-4">
            <ScoreRing score={globalScore} size={42} />
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Checklist Completamento</h2>
              <p className="text-[11px] text-zinc-400">
                {globalScore === 100 ? 'Il tuo sito e completo!' : `${globalResults.filter(r => r.passed).length}/${globalResults.length} passaggi completati`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Global section */}
          <div className="p-6 border-b border-zinc-100">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4">Sito — Generale</h3>
            <div className="space-y-4">
              {renderResults(globalResults)}
            </div>
          </div>

          {/* Per-page sections */}
          <div className="p-6">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-4">Pagine</h3>
            <div className="space-y-2">
              {pageScores.map(({ page, results, score }) => {
                const isOpen = activePageId === page.id;
                const allDone = score === 100;
                return (
                  <div key={page.id} className={cn("border rounded-xl transition-all", isOpen ? "border-zinc-200 bg-zinc-50/50" : "border-zinc-100")}>
                    <button
                      onClick={() => setActivePageId(isOpen ? null : page.id)}
                      className="w-full flex items-center gap-3 px-4 py-3"
                    >
                      <ScoreRing score={score} size={28} />
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-[12px] font-semibold text-zinc-800 truncate">{page.title || page.slug}</div>
                        <div className="text-[10px] text-zinc-400">/{page.slug}</div>
                      </div>
                      {allDone ? (
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      ) : (
                        <span className="text-[10px] font-medium text-zinc-400 shrink-0">
                          {results.filter(r => r.passed).length}/{results.length}
                        </span>
                      )}
                      <ChevronDown size={12} className={cn("text-zinc-300 transition-transform", isOpen && "rotate-180")} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-4 animate-in fade-in duration-150">
                        {renderResults(results)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
