'use client';

import React, { useState } from 'react';
import { Palette, Layout, Type, Settings as SettingsIcon, Mic, MicOff, Plus, Loader2, Sparkles, Wand2, Info, Image as ImageIcon, AlertCircle, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { FontManager } from '../../blocks/sidebar/ui/FontManager';
import { cn } from '@/lib/utils';
import { BUSINESS_TYPES } from '@/lib/editor-constants';
import { generateProjectWithAI, validateProjectDescription } from '@/app/actions/ai-generator';
import { supabase } from '@/lib/supabase';

interface AIGeneratorModalProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
  user: any;
}

const STEP_LABELS = ['Info', 'Descrizione', 'Pagine', 'Stile'];

const SUGGESTED_PAGES: Record<string, { name: string; description: string }[]> = {
  LocalBusiness: [
    { name: 'Chi Siamo', description: 'Storia, mission e valori dell\'attività' },
    { name: 'Servizi', description: 'Lista dei servizi offerti con descrizioni' },
    { name: 'Contatti', description: 'Modulo contatto, mappa e informazioni' },
  ],
  HomeAndConstructionBusiness: [
    { name: 'Servizi', description: 'Tipologie di interventi e manutenzioni offerte' },
    { name: 'Lavori Realizzati', description: 'Galleria di progetti completati con descrizioni' },
    { name: 'Contatti', description: 'Form per richiesta preventivo e contatti diretti' },
  ],
  Restaurant: [
    { name: 'Menu', description: 'Piatti, bevande e prezzi organizzati per categorie' },
    { name: 'Chi Siamo', description: 'La storia del locale, lo chef e la filosofia' },
    { name: 'Contatti', description: 'Orari, mappa, prenotazioni e contatti' },
  ],
  HealthAndBeautyBusiness: [
    { name: 'Trattamenti', description: 'Lista servizi e trattamenti con descrizioni' },
    { name: 'Il Team', description: 'Professionisti, specializzazioni e qualifiche' },
    { name: 'Prenota', description: 'Prenotazione appuntamento e contatti' },
  ],
  ProfessionalService: [
    { name: 'Servizi', description: 'Aree di competenza e servizi offerti' },
    { name: 'Chi Sono', description: 'Esperienza, qualifiche e approccio professionale' },
    { name: 'Contatti', description: 'Form contatto e modalità di consulenza' },
  ],
  EducationalOrganization: [
    { name: 'Corsi', description: 'Catalogo corsi con programmi e durata' },
    { name: 'Docenti', description: 'Team di insegnanti e le loro competenze' },
    { name: 'Iscrizioni', description: 'Modalità di iscrizione e contatti' },
  ],
  SportsActivityLocation: [
    { name: 'Corsi & Attività', description: 'Programma attività, orari e livelli' },
    { name: 'Abbonamenti', description: 'Piani, prezzi e vantaggi per ogni abbonamento' },
    { name: 'Contatti', description: 'Dove siamo, orari e form di contatto' },
  ],
  TravelAgency: [
    { name: 'Destinazioni', description: 'Mete proposte con descrizioni e pacchetti' },
    { name: 'Servizi', description: 'Tipologie di viaggio e servizi inclusi' },
    { name: 'Prenota', description: 'Form di prenotazione e richiesta preventivo' },
  ],
  Store: [
    { name: 'Prodotti', description: 'Catalogo prodotti organizzato per categorie' },
    { name: 'Chi Siamo', description: 'Storia del negozio e i nostri valori' },
    { name: 'Contatti', description: 'Dove trovarci, orari e assistenza clienti' },
  ],
  Organization: [
    { name: 'Chi Siamo', description: 'Mission, storia e il team' },
    { name: 'Contatti', description: 'Modulo contatto e informazioni' },
  ],
};

const SITE_OBJECTIVES = [
  { value: 'book', label: 'Prenotare un appuntamento' },
  { value: 'contact', label: 'Contattarmi (chiamata/email)' },
  { value: 'quote', label: 'Richiedere un preventivo' },
  { value: 'buy', label: 'Acquistare un prodotto/servizio' },
  { value: 'info', label: 'Informarsi sulla mia attività' },
];

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professionale' },
  { value: 'friendly', label: 'Amichevole' },
  { value: 'formal', label: 'Formale' },
  { value: 'creative', label: 'Creativo' },
];

export function AIGeneratorModal({ onClose, onSuccess, user }: AIGeneratorModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [language, setLanguage] = useState('it');

  // Form State
  const [businessName, setBusinessName] = useState('Ristorante da Mario');
  const [businessType, setBusinessType] = useState('LocalBusiness');
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | null>(null);
  const [businessEmail, setBusinessEmail] = useState('info@damario.it');
  const [businessPhone, setBusinessPhone] = useState('+39 012 3456789');
  const [businessAddress, setBusinessAddress] = useState('Via Roma 123');
  const [businessCity, setBusinessCity] = useState('Milano');
  const [businessZip, setBusinessZip] = useState('20100');
  const [businessCountry, setBusinessCountry] = useState('Italia');
  const [instagram, setInstagram] = useState('https://instagram.com/damario');
  const [facebook, setFacebook] = useState('https://facebook.com/damario');
  const [whatsapp, setWhatsapp] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [description, setDescription] = useState('Un accogliente ristorante italiano specializzato in piatti tipici della tradizione milanese, con ingredienti a km zero e un\'atmosfera familiare.');
  const [siteObjective, setSiteObjective] = useState('contact');
  const [useAnchorNav, setUseAnchorNav] = useState(true);
  const [tone, setTone] = useState('professional');
  const [strengths, setStrengths] = useState(['', '', '']);
  const [extraPages, setExtraPages] = useState<{ name: string; description: string }[]>([]);
  const [pagesInitialized, setPagesInitialized] = useState(false);
  const [lastValidatedPages, setLastValidatedPages] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDesc, setNewPageDesc] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationQuestions, setValidationQuestions] = useState<any[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'auto'>('auto');
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);

  const inputClass = "w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300";

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_SCREENSHOTS = 5;

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('Il logo non può superare i 5MB.');
        return;
      }
      setIsUploading(true);
      const ext = file.name.split('.').pop();
      const filename = `logo-${Date.now()}.${ext}`;
      const path = `ai-temp/${user.id}/${filename}`;

      const { data } = await supabase.storage
        .from('project-assets')
        .upload(path, file);

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('project-assets')
          .getPublicUrl(path);
        setBusinessLogoUrl(publicUrl);
      }
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const incoming = Array.from(files);
    if (screenshotUrls.length + incoming.length > MAX_SCREENSHOTS) {
      setError(`Massimo ${MAX_SCREENSHOTS} screenshot.`);
      return;
    }

    setIsUploading(true);
    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`"${file.name}" supera i 5MB e verrà saltato.`);
        continue;
      }
      const ext = file.name.split('.').pop();
      const filename = `screenshot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}.${ext}`;
      const path = `ai-temp/${user.id}/${filename}`;

      const { data } = await supabase.storage
        .from('project-assets')
        .upload(path, file);

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('project-assets')
          .getPublicUrl(path);
        setScreenshotUrls(prev => [...prev, publicUrl]);
      }
    }
    setIsUploading(false);
  };

  const runValidation = async (pagesToValidate: any[]) => {
    setIsValidating(true);
    setError(null);
    try {
      const result = await validateProjectDescription({
        businessName,
        businessType,
        description,
        extraPages: pagesToValidate,
        email: businessEmail,
        phone: businessPhone,
        address: businessAddress,
        city: businessCity,
        zip: businessZip,
        country: businessCountry,
        socials: [
          { platform: 'instagram', url: instagram },
          { platform: 'facebook', url: facebook },
          { platform: 'whatsapp', url: whatsapp },
          { platform: 'x', url: twitter },
          { platform: 'linkedin', url: linkedin }
        ].filter(s => s.url)
      });

      if (result.isReady || !result.questions || result.questions.length === 0) {
        setStepIndex(3);
      } else {
        setValidationQuestions(result.questions);
        setShowValidation(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Errore durante la validazione IA.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidationAnswer = (id: string, value: string) => {
    const q = validationQuestions.find(v => v.id === id);
    if (q) {
      setDescription(prev => (prev + '\n\n- ' + q.question + ': ' + value));
      const remaining = validationQuestions.filter(v => v.id !== id);
      setValidationQuestions(remaining);
      if (remaining.length === 0) {
        setShowValidation(false);
        setStepIndex(3);
      }
    }
  };

  const toggleListening = (type: 'description' | 'extra' = 'description') => {
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Il tuo browser non supporta il riconoscimento vocale.");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = 'it-IT';
    rec.continuous = true;
    rec.interimResults = true;

    let finalTranscript = '';
    const initialText = type === 'description' ? description : newPageDesc;

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const newTranscription = (finalTranscript + interimTranscript).trim();
      if (newTranscription) {
        const fullText = initialText ? (initialText + ' ' + newTranscription) : newTranscription;
        if (type === 'description') setDescription(fullText);
        else setNewPageDesc(fullText);
      }
    };

    rec.start();
    setRecognition(rec);
  };

  const handleStartGeneration = async () => {
    setError(null);
    setIsGenerating(true);

    const interval = setInterval(() => {
      setProgress(p => (p < 90 ? p + Math.random() * 10 : p));
    }, 2000);

    // Timeout: 90 secondi max
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setError('La generazione sta impiegando troppo tempo. Riprova.');
      setIsGenerating(false);
      setProgress(0);
    }, 90000);

    try {
      const socials = [
        { platform: 'instagram', url: instagram },
        { platform: 'facebook', url: facebook },
        { platform: 'whatsapp', url: whatsapp },
        { platform: 'x', url: twitter },
        { platform: 'linkedin', url: linkedin }
      ].filter(s => s.url);

      const filledStrengths = strengths.filter(s => s.trim());

      const result = await generateProjectWithAI({
        businessName,
        businessType,
        description,
        extraPages,
        logoUrl: businessLogoUrl || undefined,
        screenshotUrls: screenshotUrls,
        language,
        email: businessEmail || undefined,
        phone: businessPhone || undefined,
        address: businessAddress || undefined,
        city: businessCity || undefined,
        zip: businessZip || undefined,
        country: businessCountry || undefined,
        socials: socials.length > 0 ? socials : undefined,
        primaryColor: primaryColor || undefined,
        secondaryColor: secondaryColor || undefined,
        fontFamily: fontFamily || undefined,
        appearance: appearance === 'auto' ? undefined : appearance,
        siteObjective,
        tone,
        strengths: filledStrengths.length > 0 ? filledStrengths : undefined,
        useAnchorNav: extraPages.length === 0 ? useAnchorNav : undefined,
      });

      clearTimeout(timeout);
      clearInterval(interval);
      if (result.success) {
        setProgress(100);
        setTimeout(() => {
          onSuccess({
            ...result.data,
            businessName,
            language
          });
        }, 800);
      } else {
        setError(result.error || 'Errore imprevisto');
        setIsGenerating(false);
        setProgress(0);
      }
    } catch (err: any) {
      clearTimeout(timeout);
      clearInterval(interval);
      setError(err.message || 'Errore tecnico');
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleNextStep = async () => {
    setError(null);
    if (stepIndex === 2) {
      // Auto-save page if fields are filled (add or update)
      const pagesToValidate = [...extraPages];
      if (newPageName.trim() && newPageDesc.trim()) {
        if (editingPageIdx !== null) {
          pagesToValidate[editingPageIdx] = { name: newPageName.trim(), description: newPageDesc.trim() };
        } else {
          pagesToValidate.push({ name: newPageName.trim(), description: newPageDesc.trim() });
        }
        setExtraPages(pagesToValidate);
        setNewPageName('');
        setNewPageDesc('');
        setEditingPageIdx(null);
      }
      // Skip validation if pages haven't changed since last run
      const pagesHash = JSON.stringify(pagesToValidate) + description;
      if (lastValidatedPages === pagesHash) {
        setStepIndex(3);
        return;
      }
      setLastValidatedPages(pagesHash);
      await runValidation(pagesToValidate);
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const [editingPageIdx, setEditingPageIdx] = useState<number | null>(null);

  const addPage = () => {
    if (newPageName.trim() && newPageDesc.trim()) {
      if (editingPageIdx !== null) {
        // Update existing page
        const updated = [...extraPages];
        updated[editingPageIdx] = { name: newPageName.trim(), description: newPageDesc.trim() };
        setExtraPages(updated);
        setEditingPageIdx(null);
      } else {
        setExtraPages([...extraPages, { name: newPageName.trim(), description: newPageDesc.trim() }]);
      }
      setNewPageName('');
      setNewPageDesc('');
    }
  };

  const editPage = (idx: number) => {
    setNewPageName(extraPages[idx].name);
    setNewPageDesc(extraPages[idx].description);
    setEditingPageIdx(idx);
  };

  const cancelEditPage = () => {
    setNewPageName('');
    setNewPageDesc('');
    setEditingPageIdx(null);
  };

  const removePage = (idx: number) => {
    setExtraPages(extraPages.filter((_, i) => i !== idx));
    if (editingPageIdx === idx) cancelEditPage();
  };

  const removeScreenshot = (idx: number) => {
    setScreenshotUrls(screenshotUrls.filter((_, i) => i !== idx));
  };

  const canGoNext = () => {
    if (stepIndex === 0) return !!businessName.trim();
    if (stepIndex === 1) return description.length >= 10;
    return true;
  };

  // Generating screen
  if (isGenerating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles size={18} className="text-indigo-500" />
                <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Generazione in corso</h2>
            </div>
          </div>

          <div className="p-6 py-16 space-y-10">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center animate-pulse">
                  <Wand2 size={32} className="text-zinc-900 animate-bounce" />
                </div>
                <div className="absolute -top-2 -right-2 p-1.5 bg-zinc-900 text-white rounded-xl shadow-lg border-4 border-white">
                  <Sparkles size={12} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Creazione della Magia...</h3>
                <p className="text-sm text-zinc-400 mt-1">L'IA sta scrivendo i testi e progettando il layout.</p>
              </div>
            </div>

            <div className="space-y-3 max-w-sm mx-auto">
              <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full transition-all duration-500 relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <span>
                  {progress < 30 ? 'Analisi contesto...' :
                   progress < 60 ? 'Progettazione layout...' :
                   progress < 90 ? 'Stesura contenuti...' : 'Finalizzazione...'}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
                <div className="text-xs text-red-600 font-medium">{error}</div>
              </div>
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite linear;
          }
        `}} />
      </div>
    );
  }

  // Validation overlay
  if (showValidation && validationQuestions.length > 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">Un paio di domande...</h2>
            <button onClick={() => { setShowValidation(false); setStepIndex(3); }} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
              <X size={16} />
            </button>
          </div>
          <div className="p-6 space-y-5">
            <p className="text-xs text-zinc-400">Per un risultato perfetto abbiamo bisogno di qualche dettaglio in più.</p>
            {validationQuestions.map((q, i) => (
              <div key={q.id || `q-${i}`} className="space-y-1.5 animate-in fade-in slide-in-from-right-2 duration-200" style={{ animationDelay: `${i * 80}ms` }}>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{q.question || q.text}</label>
                <input
                  autoFocus={i === 0}
                  placeholder={q.placeholder || "Scrivi qui la risposta..."}
                  className={inputClass}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleValidationAnswer(q.id || `q-${i}`, (e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white">
            <button onClick={() => { setShowValidation(false); setStepIndex(1); }} className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
              <ChevronLeft size={14} />
              Modifica
            </button>
            <button onClick={() => { setShowValidation(false); setStepIndex(3); }} className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all">
              Salta e continua
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header with step indicator */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles size={16} className="text-indigo-500" />
                <div className="absolute inset-0 bg-indigo-400/20 blur-md rounded-full animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Crea con IA</h2>
            </div>
            <div className="flex items-center gap-1.5">
              {STEP_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  {i > 0 && <div className={cn("w-4 h-px", i <= stepIndex ? "bg-zinc-900" : "bg-zinc-200")} />}
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                    i < stepIndex ? "bg-emerald-50 text-emerald-600" :
                    i === stepIndex ? "bg-zinc-900 text-white" :
                    "bg-zinc-100 text-zinc-400"
                  )}>
                    {i < stepIndex ? <Check size={10} /> : <span>{i + 1}</span>}
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar overflow-x-visible">

          {/* Step 0: Info */}
          {stepIndex === 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Nome dell'Attività</label>
                  <input
                    autoFocus
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Es: Pizzeria da Mario"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Lingua Generazione</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className={inputClass}
                  >
                    <option value="it">🇮🇹 Italiano</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Settore</label>
                <select
                  value={businessType}
                  onChange={e => setBusinessType(e.target.value)}
                  className={inputClass}
                >
                  {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Email</label>
                  <input value={businessEmail} onChange={e => setBusinessEmail(e.target.value)} placeholder="info@azienda.it" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Telefono</label>
                  <input value={businessPhone} onChange={e => setBusinessPhone(e.target.value)} placeholder="+39 012 3456789" className={inputClass} />
                </div>
              </div>

              <div className="space-y-3">
                <input value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} placeholder="Via e Numero" className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input value={businessCity} onChange={e => setBusinessCity(e.target.value)} placeholder="Città" className={inputClass} />
                  <input value={businessZip} onChange={e => setBusinessZip(e.target.value)} placeholder="CAP" className={inputClass} />
                </div>
                <input value={businessCountry} onChange={e => setBusinessCountry(e.target.value)} placeholder="Paese" className={inputClass} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Social Links (Opzionale)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Instagram URL" className={inputClass} />
                  <input value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="Facebook URL" className={inputClass} />
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp" className={inputClass} />
                  <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="X (Twitter) URL" className={inputClass} />
                  <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className={inputClass} />
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <div className="relative group/logo w-16 h-16 rounded-lg bg-white border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {isUploading ? (
                    <Loader2 className="animate-spin text-zinc-300" size={24} />
                  ) : businessLogoUrl ? (
                    <img src={businessLogoUrl} className="w-full h-full object-contain" alt="Logo preview" />
                  ) : (
                    <ImageIcon className="text-zinc-200" size={24} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-bold text-zinc-900">Logo aziendale</div>
                  <div className="text-[10px] text-zinc-400">Clicca per caricare</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Descrizione */}
          {stepIndex === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* Descrizione */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Descrivi la tua attività</label>
                  <div className="group relative">
                    <Info size={13} className="text-zinc-300 cursor-help hover:text-zinc-500 transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-56 p-3 bg-zinc-900 text-white text-[10px] rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 leading-relaxed">
                      Raccontaci cosa fai, cosa offri e cosa ti rende unico. Più dettagli dai, migliore sarà il risultato.
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    autoFocus
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Es: Siamo un ristorante a conduzione familiare specializzato in cucina tradizionale milanese..."
                    className="w-full h-28 px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300 resize-none leading-relaxed"
                  />
                  <button
                    onClick={() => toggleListening('description')}
                    className={cn(
                      "absolute bottom-3 right-3 p-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5",
                      isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-zinc-400 hover:text-zinc-900 border border-zinc-200"
                    )}
                    title={isListening ? "Ferma ascolto" : "Dettatura vocale"}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening && <span className="text-[9px] font-bold uppercase">Ascolto...</span>}
                  </button>
                </div>
              </div>

              {/* Obiettivo + Tono */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Obiettivo del sito</label>
                  <select value={siteObjective} onChange={e => setSiteObjective(e.target.value)} className={inputClass}>
                    {SITE_OBJECTIVES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tono di voce</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TONE_OPTIONS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all",
                          tone === t.value
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Punti di forza */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Perché scegliere te? <span className="font-normal normal-case text-zinc-300">(opzionale)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {strengths.map((s, i) => (
                    <input
                      key={i}
                      value={s}
                      onChange={e => {
                        const updated = [...strengths];
                        updated[i] = e.target.value;
                        setStrengths(updated);
                      }}
                      placeholder={['Es: Ingredienti a Km 0', 'Es: 20 anni di esperienza', 'Es: Consegna gratuita'][i]}
                      className={inputClass}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Pagine */}
          {stepIndex === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Struttura del sito</label>
              </div>

              {/* Single vs Multi page toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setExtraPages([]); cancelEditPage(); }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left space-y-2",
                    extraPages.length === 0
                      ? "border-zinc-900 bg-zinc-50 shadow-sm"
                      : "border-zinc-100 hover:border-zinc-300"
                  )}
                >
                  <div className="text-[12px] font-semibold text-zinc-800">Pagina singola</div>
                  <div className="text-[10px] text-zinc-400 leading-relaxed">
                    Tutto in una pagina scorrevole. Perfetta per landing page, portfolio e attività semplici. Veloce da creare, facile da navigare.
                  </div>
                </button>
                <button
                  onClick={() => {
                    if (extraPages.length === 0) {
                      const suggested = SUGGESTED_PAGES[businessType] || SUGGESTED_PAGES.LocalBusiness;
                      setExtraPages(suggested.map(p => ({ ...p })));
                    }
                  }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left space-y-2",
                    extraPages.length > 0
                      ? "border-zinc-900 bg-zinc-50 shadow-sm"
                      : "border-zinc-100 hover:border-zinc-300"
                  )}
                >
                  <div className="text-[12px] font-semibold text-zinc-800">Multi-pagina</div>
                  <div className="text-[10px] text-zinc-400 leading-relaxed">
                    Ogni sezione ha la sua pagina dedicata. Ideale per attività con molti servizi, menu, team o contenuti da approfondire.
                  </div>
                </button>
              </div>

              {/* Anchor nav option for single page */}
              {extraPages.length === 0 && (
                <label className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100 cursor-pointer hover:border-zinc-200 transition-all">
                  <input
                    type="checkbox"
                    checked={useAnchorNav}
                    onChange={e => setUseAnchorNav(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
                  />
                  <div>
                    <div className="text-[12px] font-semibold text-zinc-800">Menu di navigazione con ancore</div>
                    <div className="text-[10px] text-zinc-400">Aggiunge un menu fisso che scorre verso le sezioni della pagina (Chi siamo, Servizi, Contatti...)</div>
                  </div>
                </label>
              )}

              {/* Page list */}
              {extraPages.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Home + {extraPages.length} {extraPages.length === 1 ? 'pagina' : 'pagine'}</div>
                  <div className="space-y-1">
                    {extraPages.map((p, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all group",
                          editingPageIdx === i
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-zinc-50 border border-zinc-100 hover:border-zinc-200"
                        )}
                        onClick={() => editPage(i)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-[12px] font-semibold", editingPageIdx === i ? "text-blue-700" : "text-zinc-800")}>{p.name}</div>
                          <div className="text-[10px] text-zinc-400 truncate">{p.description}</div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removePage(i); }}
                          className="p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add/Edit page form — only in multi-page mode */}
              {extraPages.length > 0 && <div className="space-y-2 pt-1">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-100" />
                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                    {editingPageIdx !== null ? 'Modifica pagina' : 'Aggiungi pagina'}
                  </span>
                  <div className="h-px flex-1 bg-zinc-100" />
                </div>
                <input
                  value={newPageName}
                  onChange={e => setNewPageName(e.target.value)}
                  placeholder="Nome della pagina (es: Servizi, Portfolio...)"
                  className={inputClass}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPage(); } }}
                />
                <div className="relative">
                  <textarea
                    value={newPageDesc}
                    onChange={e => setNewPageDesc(e.target.value)}
                    placeholder="Descrivi cosa vuoi in questa pagina..."
                    className="w-full h-20 px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300 resize-none"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addPage(); } }}
                  />
                  <button
                    onClick={() => toggleListening('extra')}
                    className={cn(
                      "absolute bottom-2 right-2 p-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center",
                      isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-zinc-400 hover:text-zinc-900 border border-zinc-200"
                    )}
                  >
                    {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={!newPageName.trim() || !newPageDesc.trim()}
                    onClick={addPage}
                    className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={13} />
                    {editingPageIdx !== null ? 'Salva Modifica' : 'Aggiungi Pagina'}
                  </button>
                  {editingPageIdx !== null && (
                    <button
                      onClick={cancelEditPage}
                      className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-600 border border-zinc-200 rounded-xl transition-colors"
                    >
                      Annulla
                    </button>
                  )}
                </div>
              </div>}
            </div>
          )}

          {/* Step 3: Stile */}
          {stepIndex === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* Tema */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Tema</label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: 'auto' as const, label: 'IA Decide', preview: 'bg-gradient-to-br from-white to-zinc-900' },
                    { value: 'light' as const, label: 'Chiaro', preview: 'bg-white' },
                    { value: 'dark' as const, label: 'Scuro', preview: 'bg-zinc-900' },
                  ]).map(t => (
                    <button
                      key={t.value}
                      onClick={() => setAppearance(t.value)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-center",
                        appearance === t.value
                          ? "border-zinc-900 shadow-sm"
                          : "border-zinc-100 hover:border-zinc-300"
                      )}
                    >
                      <div className={cn("w-full h-8 rounded-lg mb-2 border border-zinc-200", t.preview)} />
                      <div className="text-[11px] font-semibold text-zinc-700">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colori */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Colore Primario</label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-zinc-200 rounded-xl">
                    <input
                      type="color"
                      value={primaryColor || '#3b82f6'}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {primaryColor ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-semibold text-zinc-600">{primaryColor}</span>
                          <button onClick={() => setPrimaryColor(null)} className="text-zinc-300 hover:text-zinc-500"><X size={11} /></button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">Scelto dall&apos;IA</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Colore Sfondo</label>
                  <div className="flex items-center gap-2 px-3 py-2 border border-zinc-200 rounded-xl">
                    <input
                      type="color"
                      value={secondaryColor || '#ffffff'}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border-none bg-transparent shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {secondaryColor ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono font-semibold text-zinc-600">{secondaryColor}</span>
                          <button onClick={() => setSecondaryColor(null)} className="text-zinc-300 hover:text-zinc-500"><X size={11} /></button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">Scelto dall&apos;IA</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Font */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Font</label>
                {fontFamily === null ? (
                  <button
                    onClick={() => setFontFamily('Inter')}
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-[11px] text-zinc-400 text-left hover:border-zinc-300 transition-all italic"
                  >
                    Scelto dall&apos;IA — clicca per personalizzare
                  </button>
                ) : (
                  <div className="relative group/font">
                    <FontManager value={fontFamily} onChange={setFontFamily} label="Font Principale" />
                    <button onClick={() => setFontFamily(null)} className="absolute top-0 right-1 p-1 text-zinc-300 hover:text-zinc-900 transition-all" title="Reset">
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Screenshots */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Screenshot di riferimento <span className="font-normal normal-case text-zinc-300">(opzionale)</span>
                </label>
                <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center group hover:border-zinc-300 transition-all relative overflow-hidden">
                  <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="flex items-center justify-center gap-2">
                    <ImageIcon className="text-zinc-300" size={16} />
                    <div className="text-[11px] text-zinc-500">Carica immagini da cui estrarre stile</div>
                  </div>
                </div>
                {screenshotUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {screenshotUrls.map((s, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-200 group/thumb">
                        <img src={s} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                        <button onClick={() => removeScreenshot(i)} className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 text-white rounded opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Padding for font dropdown overflow */}
              {fontFamily !== null && <div className="h-32" />}
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mb-0 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
            <div className="text-xs text-red-600 font-medium flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-red-500 shrink-0"><X size={12} /></button>
          </div>
        )}

        {/* Footer with navigation */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white">
          <div>
            {stepIndex > 0 ? (
              <button
                onClick={() => setStepIndex(stepIndex - 1)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                <ChevronLeft size={14} />
                Indietro
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
              >
                Annulla
              </button>
            )}
          </div>
          <div>
            {stepIndex < 3 ? (
              <button
                onClick={handleNextStep}
                disabled={!canGoNext() || isValidating}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Analisi...
                  </>
                ) : (
                  <>
                    Avanti
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleStartGeneration}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all"
              >
                <Sparkles size={14} />
                Genera con IA
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
