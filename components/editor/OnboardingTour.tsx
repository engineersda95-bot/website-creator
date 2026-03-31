'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Layers, MousePointer, PanelRight, Monitor, Rocket, RotateCcw, ZoomIn, HelpCircle, Sun, Edit3 } from 'lucide-react';
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
    target: '[data-tour="block-sidebar"]',
    title: 'Struttura & Blocchi',
    description: 'Qui trovi la struttura della pagina con tutti i blocchi. Trascinali per riordinarli. Sotto, la libreria con 20+ blocchi: Hero, Testo, FAQ e molto altro. Clicca per aggiungere.',
    icon: <Layers size={18} />,
    position: 'right',
  },
  {
    target: '[data-tour="canvas"]',
    title: 'Il tuo sito in tempo reale',
    description: 'Questa e l\'anteprima live. Clicca su un blocco per selezionarlo. Fai doppio click sui testi per modificarli direttamente. Usa il "+" tra i blocchi per inserirne di nuovi.',
    icon: <MousePointer size={18} />,
    position: 'left',
  },
  {
    target: '[data-tour="config-sidebar"]',
    title: 'Modifica tutto da qui',
    description: 'Quando selezioni un blocco, qui trovi tutti i controlli: contenuti, stile, colori, spaziature. Le sezioni si aprono a fisarmonica. Se nessun blocco e selezionato, vedi le impostazioni globali.',
    icon: <PanelRight size={18} />,
    position: 'left',
  },
  {
    target: '[data-tour="viewport-switcher"]',
    title: 'Desktop, Tablet, Mobile',
    description: 'Passa tra i dispositivi per vedere come appare il sito. Ogni vista puo avere stili diversi: riduci il padding su mobile, cambia le colonne della griglia.',
    icon: <Monitor size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="undo-redo"]',
    title: 'Annulla e Ripristina',
    description: 'Hai sbagliato? Ctrl+Z per annullare, Ctrl+Y per ripristinare. La cronologia tiene fino a 50 passaggi.',
    icon: <RotateCcw size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="zoom-controls"]',
    title: 'Zoom',
    description: 'Avvicinati ai dettagli o allontanati per una visione d\'insieme. Clicca sulla percentuale per tornare al 100%.',
    icon: <ZoomIn size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="theme-toggle"]',
    title: 'Tema Chiaro / Scuro',
    description: 'Alterna il tema del sito. Questo cambia sfondo e testo di tutte le sezioni — perfetto per siti con atmosfera dark.',
    icon: <Sun size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="help-btn"]',
    title: 'Serve aiuto?',
    description: 'Qui trovi guide su blocchi, SEO, pubblicazione e scorciatoie da tastiera. Puoi anche riavviare questo tour.',
    icon: <HelpCircle size={18} />,
    position: 'bottom',
  },
  {
    target: '[data-tour="publish-btn"]',
    title: 'Salva e Pubblica',
    description: 'Salva con il pulsante blu (o Ctrl+S). Quando sei pronto, clicca Pubblica per mettere il sito online. Buon lavoro!',
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
    const t = setTimeout(() => setActive(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Find target element for current step
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
      const targetSelector = STEPS[step]?.target;
      if (!targetSelector) return;
      const el = document.querySelector(targetSelector);
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

  // Tooltip positioning
  let tooltipStyle: React.CSSProperties = {};
  if (rect) {
    const { position } = current;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const tooltipH = 200;
    const tooltipW = 320;
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
      tooltipStyle = { top: Math.max(16, Math.min(centerY, vh - tooltipH)), left: Math.max(16, Math.min(centerX, vw - tooltipW - 16)), transform: 'translate(-50%, -50%)' };
    }
  } else {
    tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none">
      {/* Dark overlay */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }}
      />

      {/* Spotlight */}
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
        className="fixed z-[100000] w-80 bg-white rounded-2xl shadow-2xl border border-zinc-200 pointer-events-auto animate-in fade-in zoom-in-95 duration-200"
        style={tooltipStyle}
      >
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-bold text-zinc-900">{current.title}</h3>
              <span className="text-[10px] text-zinc-400 font-medium">{step + 1} di {STEPS.length}</span>
            </div>
            <button onClick={finish} className="p-1.5 text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors shrink-0">
              <X size={14} />
            </button>
          </div>
          <p className="text-[13px] text-zinc-500 leading-relaxed">{current.description}</p>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "bg-blue-600 w-4" : i < step ? "bg-blue-300 w-1.5" : "bg-zinc-200 w-1.5")} />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1.5">
            {step === 0 ? (
              <button onClick={finish} className="px-3 py-1.5 text-[12px] font-medium text-zinc-400 hover:text-zinc-600 transition-all">
                Salta
              </button>
            ) : (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 px-3 py-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 rounded-lg transition-all">
                <ChevronLeft size={14} /> Indietro
              </button>
            )}
            <button
              onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : finish()}
              className="flex items-center gap-1 px-4 py-1.5 text-[12px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
            >
              {step < STEPS.length - 1 ? (<>Avanti <ChevronRight size={14} /></>) : 'Inizia!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
