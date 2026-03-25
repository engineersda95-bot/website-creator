'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Layers, MousePointer, PanelRight, Monitor, Rocket, FileText, RotateCcw, ZoomIn, HelpCircle, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourStep {
  target: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'right' | 'left' | 'bottom' | 'top';
}

const STEPS: TourStep[] = [
  {
    target: '[data-tour="page-status"]',
    title: 'Benvenuto nell\'Editor!',
    description: 'Qui vedi la pagina attuale e lo stato del sito: Non pubblicato (grigio), Bozza (arancione) o Online (verde). Iniziamo il tour!',
    icon: <FileText size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="page-manager"]',
    title: 'Gestione Pagine',
    description: 'Qui gestisci le pagine del sito. Clicca su una pagina per aprirla, usa il "+" per crearne di nuove. L\'icona globo apre le impostazioni SEO.',
    icon: <FileText size={18} />,
    position: 'right',
  },
  {
    target: '[data-tour="block-sidebar"]',
    title: 'Blocchi e Struttura',
    description: 'In alto trovi la struttura della pagina attuale con tutti i blocchi. Sotto, la libreria con 20+ blocchi disponibili: Hero, Testo, Contatti, FAQ e molto altro. Clicca per aggiungerne uno.',
    icon: <Layers size={18} />,
    position: 'right',
  },
  {
    target: '[data-tour="canvas"]',
    title: 'Canvas — L\'Anteprima Live',
    description: 'Questa è l\'anteprima in tempo reale del tuo sito. Clicca su qualsiasi blocco per selezionarlo e modificarlo. Usa il pulsante "+" tra i blocchi per inserirne di nuovi in una posizione precisa.',
    icon: <MousePointer size={18} />,
    position: 'left',
  },
  {
    target: '[data-tour="config-sidebar"]',
    title: 'Modifica Contenuto e Stile',
    description: 'Quando selezioni un blocco, qui trovi due tab: "Contenuto" per testi e immagini, "Stile" per colori, margini e layout. Se nessun blocco è selezionato, vedi le impostazioni globali del sito (font, colori, pulsanti).',
    icon: <PanelRight size={18} />,
    position: 'left',
  },
  {
    target: '[data-tour="viewport-switcher"]',
    title: 'Anteprima per Dispositivo',
    description: 'Passa tra Desktop, Tablet e Mobile per vedere come appare il sito su ogni schermo. Ogni vista può avere stili diversi — puoi ridurre il padding su mobile o cambiare dimensione dei testi.',
    icon: <Monitor size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="undo-redo"]',
    title: 'Annulla e Ripristina',
    description: 'Hai fatto un errore? Nessun problema. Annulla con il pulsante freccia (o Ctrl+Z) e ripristina con Ctrl+Y. La cronologia tiene fino a 50 passaggi.',
    icon: <RotateCcw size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="zoom-controls"]',
    title: 'Zoom',
    description: 'Usa i controlli zoom per avvicinarti ai dettagli o allontanarti per una visione d\'insieme. Clicca sulla percentuale per tornare al 100%.',
    icon: <ZoomIn size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: 'Tema Chiaro / Scuro',
    description: 'Alterna tra tema chiaro e scuro per il tuo sito. Questo cambia i colori di sfondo e testo di tutte le sezioni — perfetto per siti con atmosfera dark.',
    icon: <Sun size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="help-btn"]',
    title: 'Centro Assistenza',
    description: 'Hai dubbi? Clicca qui per aprire la guida completa con tutorial su blocchi, SEO, pubblicazione, scorciatoie da tastiera e molto altro.',
    icon: <HelpCircle size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="publish-btn"]',
    title: 'Salva e Pubblica',
    description: 'Salva le modifiche con il pulsante Salva (o Ctrl+S). Quando sei pronto, clicca Pubblica per rendere il sito visibile a tutti con un dominio dedicato. Buon lavoro!',
    icon: <Rocket size={18} />,
    position: 'bottom',
  },
];

const STORAGE_KEY = 'sv_onboarding_done';

let startTourFn: (() => void) | null = null;

export function restartTour() {
  startTourFn?.();
}

export const OnboardingTour: React.FC = () => {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const startTour = useCallback(() => {
    setStep(0);
    setActive(true);
  }, []);

  useEffect(() => {
    startTourFn = startTour;
    return () => { startTourFn = null; };
  }, [startTour]);

  // Auto-start on first visit
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setActive(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Find target element for current step, with retry
  useEffect(() => {
    if (!active) return;

    const clampToViewport = (r: DOMRect): DOMRect => {
      const top = Math.max(0, r.top);
      const left = Math.max(0, r.left);
      const bottom = Math.min(window.innerHeight, r.bottom);
      const right = Math.min(window.innerWidth, r.right);
      return new DOMRect(left, top, right - left, bottom - top);
    };

    const find = () => {
      const el = document.querySelector(STEPS[step]?.target);
      if (el) {
        setRect(clampToViewport(el.getBoundingClientRect()));
      } else {
        setRect(null);
        retryRef.current = setTimeout(find, 200);
      }
    };

    find();

    const onResize = () => {
      const el = document.querySelector(STEPS[step]?.target);
      if (el) setRect(clampToViewport(el.getBoundingClientRect()));
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [active, step]);

  const finish = useCallback(() => {
    setActive(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }, []);

  if (!active || !STEPS[step]) return null;

  const current = STEPS[step];
  const pad = 8;
  const hasRect = !!rect;

  // Tooltip positioning — always keep within viewport
  let tooltipStyle: React.CSSProperties = {};
  if (rect) {
    const { position } = current;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const tooltipH = 200; // approximate tooltip height
    const tooltipW = 320; // w-80

    const centerY = rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;

    if (position === 'right' && rect.right + tooltipW + 20 < vw) {
      tooltipStyle = { top: Math.min(Math.max(16, centerY), vh - tooltipH), left: rect.right + 16, transform: 'translateY(-50%)' };
    } else if (position === 'left' && rect.left - tooltipW - 20 > 0) {
      tooltipStyle = { top: Math.min(Math.max(16, centerY), vh - tooltipH), right: vw - rect.left + 16, transform: 'translateY(-50%)' };
    } else if (position === 'bottom' && rect.bottom + tooltipH + 20 < vh) {
      tooltipStyle = { top: rect.bottom + 16, left: Math.max(16, Math.min(centerX, vw - tooltipW - 16)), transform: 'translateX(-50%)' };
    } else if (position === 'top' && rect.top - tooltipH - 20 > 0) {
      tooltipStyle = { bottom: vh - rect.top + 16, left: Math.max(16, Math.min(centerX, vw - tooltipW - 16)), transform: 'translateX(-50%)' };
    } else {
      // Fallback: center of the element's visible area
      tooltipStyle = {
        top: Math.max(16, Math.min(centerY, vh - tooltipH)),
        left: Math.max(16, Math.min(centerX, vw - tooltipW - 16)),
        transform: 'translate(-50%, -50%)',
      };
    }
  } else {
    tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      {/* Dark overlay with spotlight hole */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          boxShadow: hasRect
            ? `0 0 0 9999px rgba(0,0,0,0.5), inset 0 0 0 0 rgba(0,0,0,0)`
            : '0 0 0 9999px rgba(0,0,0,0.5)',
        }}
      />

      {/* Spotlight cutout using a positioned transparent box */}
      {hasRect && (
        <div
          className="absolute rounded-xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
            border: '2px solid rgba(59,130,246,0.6)',
            zIndex: 1,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        key={step}
        className="fixed z-[100000] w-80 bg-white rounded-xl shadow-2xl border border-zinc-200 pointer-events-auto animate-in fade-in duration-200"
        style={tooltipStyle}
      >
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-zinc-900">{current.title}</h3>
              <span className="text-[10px] text-zinc-400">{step + 1} di {STEPS.length}</span>
            </div>
            <button
              onClick={finish}
              className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors shrink-0"
              title="Chiudi tour"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">{current.description}</p>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "bg-blue-600 w-4" : i < step ? "bg-blue-300 w-1.5" : "bg-zinc-200 w-1.5"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {step === 0 ? (
              <button
                onClick={finish}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-all"
              >
                Salta
              </button>
            ) : (
              <button
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 rounded-md transition-all"
              >
                <ChevronLeft size={14} />
                Indietro
              </button>
            )}
            <button
              onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : finish()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all"
            >
              {step < STEPS.length - 1 ? (
                <>Avanti <ChevronRight size={14} /></>
              ) : (
                'Inizia!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
