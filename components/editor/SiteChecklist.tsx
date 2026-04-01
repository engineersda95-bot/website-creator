'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle2, Circle, ChevronDown, Trophy, X, Bell } from 'lucide-react';
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

interface SiteChecklistProps {
  project: Project;
  pages: Page[];
  currentPage?: Page;
  variant?: 'compact' | 'full';
  onFixAction?: (action: string, target: string) => void;
}

// ─── Compact progress bar (for header/sidebar) ──────────────────────────
export const CompletionBadge: React.FC<{
  score: number;
  onClick?: () => void;
}> = ({ score, onClick }) => {
  const color = score === 100 ? 'text-emerald-600' : score >= 70 ? 'text-blue-600' : score >= 40 ? 'text-amber-600' : 'text-red-500';
  const bg = score === 100 ? 'bg-emerald-50 border-emerald-200' : score >= 70 ? 'bg-blue-50 border-blue-200' : score >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <button
      onClick={onClick}
      className={cn("flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all hover:shadow-sm", bg, color)}
      title="Completamento sito"
    >
      {score === 100 ? <Trophy size={12} /> : (
        <div className="relative w-4 h-4">
          <svg viewBox="0 0 36 36" className="w-4 h-4 -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.15" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${score * 0.88} 88`} strokeLinecap="round" />
          </svg>
        </div>
      )}
      {score}%
    </button>
  );
};

// ─── Full checklist panel ───────────────────────────────────────────────
export const SiteChecklist: React.FC<SiteChecklistProps> = ({
  project,
  pages,
  currentPage,
  variant = 'full',
  onFixAction,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showPage, setShowPage] = useState(false);

  const globalResults = useMemo(() => runGlobalChecks(project, pages), [project, pages]);
  const pageResults = useMemo(
    () => currentPage ? runPageChecks(project, pages, currentPage) : [],
    [project, pages, currentPage]
  );

  const globalScore = getCompletionScore(globalResults);
  const pageScore = currentPage ? getCompletionScore(pageResults) : 0;

  const activeResults = showPage && currentPage ? pageResults : globalResults;
  const activeScore = showPage ? pageScore : globalScore;

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CheckResult[]> = {};
    for (const r of activeResults) {
      const cat = r.item.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(r);
    }
    return groups;
  }, [activeResults]);

  if (variant === 'compact') {
    return <CompletionBadge score={globalScore} />;
  }

  return (
    <div className="space-y-4">
      {/* Score header */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#e4e4e7" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15"
              fill="none"
              stroke={activeScore === 100 ? '#10b981' : activeScore >= 70 ? '#3b82f6' : '#f59e0b'}
              strokeWidth="3"
              strokeDasharray={`${activeScore * 0.94} 94`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-zinc-700">{activeScore}%</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-bold text-zinc-900">
            {activeScore === 100 ? 'Tutto completato!' : (() => {
              const scored = activeResults.filter(r => !r.item.informational);
              return `${scored.filter(r => r.passed).length}/${scored.length} completati`;
            })()}
          </div>
          <div className="text-[11px] text-zinc-400">
            {activeScore === 100 ? 'Il tuo sito è pronto' : 'Completa i passaggi per un sito perfetto'}
          </div>
        </div>
      </div>

      {/* Tab: Global / Page */}
      {currentPage && (
        <div className="flex bg-zinc-100 p-0.5 rounded-lg">
          <button
            onClick={() => setShowPage(false)}
            className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", !showPage ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400")}
          >
            Sito ({globalScore}%)
          </button>
          <button
            onClick={() => setShowPage(true)}
            className={cn("flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all", showPage ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400")}
          >
            {currentPage.title || 'Pagina'} ({pageScore}%)
          </button>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-1">
        {Object.entries(grouped).map(([category, results]) => {
          const scored = results.filter(r => !r.item.informational);
          const passed = scored.filter(r => r.passed).length;
          const total = scored.length;
          const allDone = passed === total;
          const isExpanded = expandedCategory === category;

          return (
            <div key={category}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  isExpanded ? "bg-zinc-50" : "hover:bg-zinc-50/50"
                )}
              >
                <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", CATEGORY_COLORS[category])}>
                  {CATEGORY_LABELS[category]}
                </span>
                <span className="flex-1" />
                <span className={cn("text-[11px] font-medium", allDone ? "text-emerald-500" : "text-zinc-400")}>
                  {passed}/{total}
                </span>
                <ChevronDown size={12} className={cn("text-zinc-300 transition-transform", isExpanded && "rotate-180")} />
              </button>

              {isExpanded && (
                <div className="py-1 pl-3 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  {results.map(({ item, passed: ok, href }) => (
                    <div
                      key={item.id}
                      className={cn(
                        "flex items-start gap-2.5 px-3 py-2 rounded-lg transition-all",
                        ok ? "opacity-60" : "hover:bg-zinc-50"
                      )}
                    >
                      {ok && !item.informational ? (
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                      ) : item.informational ? (
                        <Bell size={14} className="text-amber-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle size={14} className="text-zinc-300 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-[12px] font-medium", ok ? "text-zinc-400 line-through" : "text-zinc-700")}>
                          {item.label}
                        </div>
                        {!ok && (
                          <div className="text-[10px] text-zinc-400 mt-0.5">{item.description}</div>
                        )}
                        {!ok && href && (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-blue-500 hover:text-blue-700 underline underline-offset-2 mt-1 block truncate"
                          >
                            {href}
                          </a>
                        )}
                      </div>
                      {!ok && item.fix && (onFixAction || item.fix.action === 'open-url') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.fix!.action === 'open-url') {
                              window.open(item.fix!.target, '_blank', 'noopener,noreferrer');
                            } else if (onFixAction) {
                              onFixAction(item.fix!.action, item.fix!.target);
                            }
                          }}
                          className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 shrink-0 mt-0.5"
                        >
                          {item.fix.label}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
