'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  CheckCircle2, Circle, ChevronDown, Bell,
} from 'lucide-react';
import { getCompletionScore, runGlobalChecks, runPageChecks, CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/site-checklist';
import type { Page, Project } from '@/types/editor';

interface ChecklistTabProps {
  project: Project;
  pages: Page[];
  siteGlobals: any[];
  onOpenSeo: (id: string) => void;
  onSwitchToSettings: () => void;
}

export function ChecklistTab({
  project,
  pages,
  siteGlobals,
  onOpenSeo,
  onSwitchToSettings,
}: ChecklistTabProps) {
  const gResults = runGlobalChecks(project, pages, siteGlobals);
  const gScore = getCompletionScore(gResults);
  const gPassed = gResults.filter(r => !r.item.informational && r.passed).length;
  const pageScoresData = pages.map(p => ({
    page: p,
    score: getCompletionScore(runPageChecks(project, pages, p)),
  }));
  const avgPageScore = pageScoresData.length > 0 ? Math.round(pageScoresData.reduce((s, p) => s + p.score, 0) / pageScoresData.length) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Global score */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4">
          <ScoreCircle score={gScore} size={14} />
          <div>
            <div className="text-[13px] font-bold text-zinc-900">Sito</div>
            <div className="text-[11px] text-zinc-400">{gPassed}/{gResults.filter(r => !r.item.informational).length} completati</div>
          </div>
        </div>

        {/* Pages average */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 flex items-center gap-4">
          <ScoreCircle score={avgPageScore} size={14} />
          <div>
            <div className="text-[13px] font-bold text-zinc-900">Media Pagine</div>
            <div className="text-[11px] text-zinc-400">{pageScoresData.filter(p => p.score === 100).length}/{pages.length} complete</div>
          </div>
        </div>

        {/* Overall combined */}
        {(() => {
          const combined = Math.round((gScore + avgPageScore) / 2);
          return (
            <div className={cn(
              "border rounded-2xl p-5 flex items-center gap-4",
              combined === 100 ? "bg-emerald-50 border-emerald-200" : combined >= 70 ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"
            )}>
              <ScoreCircle score={combined} size={14} useCurrentColor />
              <div>
                <div className="text-[13px] font-bold">{combined === 100 ? 'Perfetto!' : combined >= 70 ? 'Buon lavoro' : 'Da migliorare'}</div>
                <div className="text-[11px] opacity-60">Punteggio complessivo</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Global checks */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-[13px] font-bold text-zinc-900">Controlli Generali</h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Passaggi per rendere il sito completo e professionale</p>
        </div>
        <div className="divide-y divide-zinc-50">
          {gResults.map(({ item, passed: ok, href }) => (
            <div key={item.id} className={cn("flex items-center gap-3 px-5 py-3 transition-all", ok && !item.informational ? "opacity-50" : !ok ? "hover:bg-zinc-50" : "")}>
              {ok && !item.informational ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              ) : item.informational ? (
                <Bell size={16} className="text-amber-400 shrink-0" />
              ) : (
                <Circle size={16} className="text-zinc-300 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className={cn("text-[12px] font-medium", ok && !item.informational && "line-through text-zinc-400")}>{item.label}</div>
                {(!ok || item.informational) && <div className="text-[10px] text-zinc-400 mt-0.5">{item.description}</div>}
                {item.informational && href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-blue-500 hover:text-blue-700 underline underline-offset-2 mt-1 block truncate"
                  >
                    {href}
                  </a>
                )}
                {item.informational && item.fix?.action === 'open-url' && (
                  <button
                    onClick={() => window.open(item.fix!.target, '_blank', 'noopener,noreferrer')}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 mt-1"
                  >
                    {item.fix.label} →
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!ok && item.category === 'seo' && (
                  <button
                    onClick={() => onSwitchToSettings()}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Modifica SEO
                  </button>
                )}
                <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", CATEGORY_COLORS[item.category])}>
                  {CATEGORY_LABELS[item.category]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-page checks */}
      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100">
          <h3 className="text-[13px] font-bold text-zinc-900">Controlli per Pagina</h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Ogni pagina ha i suoi requisiti per un risultato ottimale</p>
        </div>
        <div className="divide-y divide-zinc-50">
          {pageScoresData.map(({ page: p, score: pScore }) => {
            const pResults = runPageChecks(project, pages, p);
            const allDone = pScore === 100;
            return (
              <details key={p.id} className="group">
                <summary className="flex items-center gap-3 px-5 py-3 cursor-pointer list-none hover:bg-zinc-50 transition-all">
                  <div className="relative w-8 h-8 shrink-0">
                    <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e4e4e7" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke={pScore === 100 ? '#10b981' : pScore >= 60 ? '#3b82f6' : '#f59e0b'} strokeWidth="3" strokeDasharray={`${pScore * 0.88} 88`} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-zinc-600">{pScore}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-zinc-800 truncate">{p.title || p.slug}</div>
                    <div className="text-[10px] text-zinc-400">/{p.slug}</div>
                  </div>
                  {allDone && <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />}
                  <ChevronDown size={12} className="text-zinc-300 group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <div className="px-5 pb-3 pl-16 space-y-1">
                  {pResults.map(({ item, passed: ok }) => (
                    <div key={item.id} className={cn("flex items-center gap-2 py-1.5", ok && "opacity-40")}>
                      {ok ? <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> : <Circle size={12} className="text-zinc-300 shrink-0" />}
                      <span className={cn("text-[11px] flex-1", ok ? "text-zinc-400 line-through" : "text-zinc-600")}>{item.label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        {!ok && item.category === 'seo' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onOpenSeo(p.id); }}
                            className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Modifica SEO
                          </button>
                        )}
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", CATEGORY_COLORS[item.category])}>
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreCircle({ score, size, useCurrentColor }: { score: number; size: number; useCurrentColor?: boolean }) {
  const color = useCurrentColor ? 'currentColor' : (score === 100 ? '#10b981' : score >= 70 ? '#3b82f6' : '#f59e0b');
  return (
    <div className="relative w-14 h-14 shrink-0">
      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke={useCurrentColor ? 'currentColor' : '#e4e4e7'} strokeWidth="2.5" opacity={useCurrentColor ? 0.15 : 1} />
        <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={`${score * 0.94} 94`} strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-800">{score}%</span>
    </div>
  );
}
