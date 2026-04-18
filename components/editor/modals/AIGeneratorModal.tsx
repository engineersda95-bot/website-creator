'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Palette, Layout, Type, Settings as SettingsIcon, Mic, MicOff, Plus, Loader2, Sparkles, Wand2, Info, Image as ImageIcon, AlertCircle, X, ChevronRight, ChevronLeft, Check, Trash2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { FontManager } from '../../blocks/sidebar/ui/FontManager';
import { cn } from '@/lib/utils';
import { ColorInput } from '../../blocks/sidebar/ui/ColorInput';
import { BUSINESS_TYPES } from '@/lib/editor-constants';
import { generateProjectWithAI, validateProjectDescription } from '@/app/actions/ai-site-generator';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/shared/Toast';

interface AIGeneratorModalProps {
  onClose: () => void;
  onSuccess: (data: any) => void;
  user: any;
}

const STEP_LABELS = ['Info', 'Descrizione', 'Pagine', 'Stile'];

const MAX_EXTRA_PAGES = 9; // 9 extra + Home = 10 total


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
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('LocalBusiness');
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | null>(null);
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [businessCity, setBusinessCity] = useState('');
  const [businessZip, setBusinessZip] = useState('');
  const [businessCountry, setBusinessCountry] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [description, setDescription] = useState('');
  const [siteObjective, setSiteObjective] = useState('');
  const [useAnchorNav, setUseAnchorNav] = useState(true);
  const [tone, setTone] = useState('professional');
  const [strengths, setStrengths] = useState<string[]>(['']);
  const [services, setServices] = useState<string[]>(['']);
  const [creativeMode, setCreativeMode] = useState(false);
  const [imageGenMode, setImageGenMode] = useState<'stock' | 'ai'>('stock');
  const [extraPages, setExtraPages] = useState<{ name: string; description: string }[]>([]);
  const [isMultiPage, setIsMultiPage] = useState(false);
  const [pagesInitialized, setPagesInitialized] = useState(false);
  const [lastValidatedPages, setLastValidatedPages] = useState<string | null>(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDesc, setNewPageDesc] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [logoStoragePath, setLogoStoragePath] = useState<string | null>(null);
  const [screenshotStoragePaths, setScreenshotStoragePaths] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationQuestions, setValidationQuestions] = useState<any[]>([]);
  const [validationAnswers, setValidationAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [validationInputs, setValidationInputs] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  // Cleanup microphone on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
      }
    };
  }, []);

  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);

  const inputClass = "w-full px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300";

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_SCREENSHOTS = 1;

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError('Il logo non può superare i 5MB.');
        return;
      }
      setIsUploading(true);
      const ext = file.name.split('.').pop();
      const path = `${user.id}/ai-temp/logo-${Date.now()}.${ext}`;

      const { data } = await supabase.storage
        .from('project-assets')
        .upload(path, file);

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('project-assets')
          .getPublicUrl(path);
        setBusinessLogoUrl(publicUrl);
        setLogoStoragePath(path);
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
      const path = `${user.id}/ai-temp/screenshot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}.${ext}`;

      const { data } = await supabase.storage
        .from('project-assets')
        .upload(path, file);

      if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('project-assets')
          .getPublicUrl(path);
        setScreenshotUrls(prev => [...prev, publicUrl]);
        setScreenshotStoragePaths(prev => [...prev, path]);
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
        siteObjective,
        tone,
        strengths: strengths.filter(s => s.trim()),
        services: services.filter(s => s.trim()),
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
    setValidationInputs(prev => ({ ...prev, [id]: value }));
  };

  const commitValidationAnswers = () => {
    const collected: { question: string; answer: string }[] = [];
    for (const q of validationQuestions) {
      const id = q.id || q.text;
      const value = (validationInputs[id] || '').trim();
      if (value) {
        collected.push({ question: q.question ?? id, answer: value });
      }
    }
    setValidationAnswers(collected);
    setShowValidation(false);
    setStepIndex(3);
  };

  const toggleListening = (type: 'description' | 'extra' = 'description') => {
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast("Il tuo browser non supporta il riconoscimento vocale.", 'error');
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
    recognitionRef.current = rec;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e) {}
    }
    setIsListening(false);
  };

  const handleStartGeneration = async () => {
    stopListening();
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
      const filledServices = services.filter(s => s.trim());

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
        accentColor: accentColor || undefined,
        bgColor: bgColor || undefined,
        textColor: textColor || undefined,
        fontFamily: fontFamily || undefined,
        siteObjective,
        tone,
        strengths: filledStrengths.length > 0 ? filledStrengths : undefined,
        services: filledServices.length > 0 ? filledServices : undefined,
        useAnchorNav: !isMultiPage ? useAnchorNav : undefined,
        creativeMode: creativeMode || undefined,
        imageGenMode: imageGenMode,
        validationAnswers: validationAnswers.length > 0 ? validationAnswers : undefined,
        // Pass storage paths so server can migrate assets directly
        logoStoragePath: logoStoragePath || undefined,
        screenshotStoragePaths: screenshotStoragePaths?.length ? screenshotStoragePaths : undefined,
      });

      clearTimeout(timeout);
      clearInterval(interval);
      if (result.success) {
        setProgress(100);
        setTimeout(() => {
          onSuccess({ projectId: result.projectId });
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
    stopListening();
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
      const pagesHash = businessName + businessType + JSON.stringify(pagesToValidate) + description;
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
        const updated = [...extraPages];
        updated[editingPageIdx] = { name: newPageName.trim(), description: newPageDesc.trim() };
        setExtraPages(updated);
        setEditingPageIdx(null);
      } else {
        if (extraPages.length >= MAX_EXTRA_PAGES) return;
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
    setScreenshotStoragePaths(screenshotStoragePaths.filter((_, i) => i !== idx));
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
                  value={validationInputs[q.id || `q-${i}`] || ''}
                  onChange={(e) => handleValidationAnswer(q.id || `q-${i}`, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitValidationAnswers(); }}
                />
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-white">
            <button onClick={() => { setShowValidation(false); setStepIndex(1); }} className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors">
              <ChevronLeft size={14} />
              Modifica
            </button>
            <button onClick={commitValidationAnswers} className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-all">
              Continua
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
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
          <button onClick={() => { stopListening(); onClose(); }} className="p-1.5 hover:bg-zinc-100 rounded-md transition-colors text-zinc-400">
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
                  <span className={cn("text-[10px] font-mono", description.length > 4500 ? "text-red-400" : "text-zinc-300")}>{description.length}/5000</span>
                </div>
                <div className="relative">
                  <textarea
                    autoFocus
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Raccontaci chi sei, cosa offri, la tua storia, il tuo pubblico, cosa ti rende unico. Più dettagli dai, migliore sarà il sito generato."
                    className="w-full h-44 px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300 resize-y leading-relaxed min-h-[7rem]"
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
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Obiettivo del sito <span className="font-normal normal-case text-zinc-300">(opzionale)</span></label>
                  <input 
                    value={siteObjective} 
                    onChange={e => setSiteObjective(e.target.value)} 
                    placeholder="Es: Ricevere prenotazioni, Contatti WhatsApp..." 
                    className={inputClass} 
                  />
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

              {/* Servizi */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  I tuoi servizi <span className="font-normal normal-case text-zinc-300">(opzionale — uno per riga)</span>
                </label>
                <div className="space-y-2">
                  {services.map((s, i) => (
                    <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                      <input
                        value={s}
                        onChange={e => {
                          const updated = [...services];
                          updated[i] = e.target.value;
                          setServices(updated);
                        }}
                        placeholder={['Es: Taglio e piega', 'Es: Colorazione', 'Es: Trattamenti capelli'][i] || 'Es: Altro servizio...'}
                        className={inputClass}
                      />
                      {services.length > 1 && (
                        <button
                          onClick={() => setServices(services.filter((_, idx) => idx !== i))}
                          className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-zinc-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {services.length < 10 && (
                    <button
                      onClick={() => setServices([...services, ''])}
                      className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all border border-dashed border-zinc-200"
                    >
                      <Plus size={12} />
                      Aggiungi servizio
                    </button>
                  )}
                </div>
              </div>

              {/* Punti di forza */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Perché scegliere te? <span className="font-normal normal-case text-zinc-300">(opzionale)</span>
                </label>
                <div className="space-y-2">
                  {strengths.map((s, i) => (
                    <div key={i} className="flex gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                      <input
                        value={s}
                        onChange={e => {
                          const updated = [...strengths];
                          updated[i] = e.target.value;
                          setStrengths(updated);
                        }}
                        placeholder={['Es: Ingredienti a Km 0', 'Es: 20 anni di esperienza', 'Es: Consegna gratuita'][i] || "Es: Qualità certificata..."}
                        className={inputClass}
                      />
                      {strengths.length > 1 && (
                        <button
                          onClick={() => setStrengths(strengths.filter((_, idx) => idx !== i))}
                          className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-zinc-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  {strengths.length < 6 && (
                    <button
                      onClick={() => setStrengths([...strengths, ''])}
                      className="flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-xl transition-all border border-dashed border-zinc-200"
                    >
                      <Plus size={12} />
                      Aggiungi punto di forza
                    </button>
                  )}
                </div>
              </div>

              {/* Modalità Creativa */}
              <button
                onClick={() => setCreativeMode(!creativeMode)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left",
                  creativeMode
                    ? "border-indigo-400 bg-indigo-50 shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                )}
              >
                <Sparkles size={16} className={creativeMode ? "text-indigo-500" : "text-zinc-400"} />
                <div className="flex-1">
                  <div className={cn("text-[12px] font-bold", creativeMode ? "text-indigo-800" : "text-zinc-700")}>Modalità Creativa</div>
                  <div className={cn("text-[10px]", creativeMode ? "text-indigo-500" : "text-zinc-400")}>Layout più ricco e variegato, fino a 10 blocchi per pagina</div>
                </div>
                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0", creativeMode ? "border-indigo-400 bg-indigo-400" : "border-zinc-300")}>
                  {creativeMode && <Check size={8} className="text-white" />}
                </div>
              </button>

              {/* Selettore Immagini AI */}
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider pl-1 font-mono">Immagini del sito</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setImageGenMode('stock')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all transition-all text-center",
                      imageGenMode === 'stock'
                        ? "border-zinc-900 bg-zinc-50 shadow-sm"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", imageGenMode === 'stock' ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-400")}>
                      <ImageIcon size={18} />
                    </div>
                    <div>
                      <div className={cn("text-[12px] font-bold", imageGenMode === 'stock' ? "text-zinc-900" : "text-zinc-500")}>Stock</div>
                      <div className="text-[10px] text-zinc-400">Gratuite</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setImageGenMode('ai')}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center relative overflow-hidden",
                      imageGenMode === 'ai'
                        ? "border-indigo-400 bg-indigo-50 shadow-sm"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    )}
                  >
                    <div className={cn("p-2 rounded-lg", imageGenMode === 'ai' ? "bg-indigo-500 text-white" : "bg-zinc-100 text-zinc-400")}>
                      <Wand2 size={18} />
                    </div>
                    <div>
                      <div className={cn("text-[12px] font-bold", imageGenMode === 'ai' ? "text-indigo-800" : "text-zinc-500")}>AI Generated</div>
                      <div className="text-[10px] text-indigo-400">+2 crediti / foto</div>
                    </div>
                    {imageGenMode === 'ai' && <div className="absolute top-0 right-0 p-1 bg-indigo-400 text-white rounded-bl-lg animate-in fade-in zoom-in duration-300"><Check size={10} /></div>}
                  </button>
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
                  onClick={() => { setIsMultiPage(false); setExtraPages([]); cancelEditPage(); }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left space-y-2",
                    !isMultiPage
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
                  onClick={() => { setIsMultiPage(true); }}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left space-y-2",
                    isMultiPage
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

              {/* Anchor nav auto-applied for single page — simplified UI */}
              {!isMultiPage && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-center gap-3">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-emerald-100">
                    <Check className="text-emerald-500" size={14} />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-tight">Navigazione ottimizzata</div>
                    <div className="text-[10px] text-emerald-600/80">Menu a scorrimento automatico abilitato per pagina singola.</div>
                  </div>
                </div>
              )}

              {/* Page list */}
              {isMultiPage && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">Home{extraPages.length > 0 ? ` + ${extraPages.length} ${extraPages.length === 1 ? 'pagina' : 'pagine'}` : ''}</div>
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
                          <div className="text-[10px] text-zinc-400 line-clamp-2">{p.description}</div>
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
              {isMultiPage && <div className="space-y-2 pt-1">
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
                    placeholder="Descrivi cosa vuoi in questa pagina: contenuti, sezioni, messaggi chiave... Più dettagli = risultato migliore."
                    className="w-full h-28 px-3.5 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-zinc-400 outline-none transition-all placeholder:text-zinc-300 resize-y min-h-[5rem]"
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
                    disabled={!newPageName.trim() || !newPageDesc.trim() || (editingPageIdx === null && extraPages.length >= MAX_EXTRA_PAGES)}
                    onClick={addPage}
                    className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={13} />
                    {editingPageIdx !== null ? 'Salva Modifica' : extraPages.length >= MAX_EXTRA_PAGES ? `Limite ${MAX_EXTRA_PAGES + 1} pagine raggiunto` : 'Aggiungi Pagina'}
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

          {/* Step 3: Stile & Riferimenti */}
          {stepIndex === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-200">
              {/* Immagine di Riferimento (Principale) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Ispirazione Stile</label>
                  <span className="text-[10px] text-zinc-400">1 immagine di riferimento</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {screenshotUrls.length === 0 && (
                    <label className="relative group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 group-hover:bg-white group-hover:border-zinc-900 transition-all text-center">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 transition-colors">
                          <ImageIcon size={24} />
                        </div>
                        <div>
                          <div className="text-[13px] font-black text-zinc-900 uppercase tracking-tight">Trascina o Clicca</div>
                          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Carica un'immagine di riferimento per lo stile</div>
                        </div>
                      </div>
                    </label>
                  )}

                  {screenshotUrls.length > 0 && (
                    <div className="relative rounded-xl overflow-hidden border border-zinc-200 group/img shadow-sm animate-in zoom-in-50 duration-200 aspect-video">
                      <img src={screenshotUrls[0]} alt="Reference" className="w-full h-full object-cover" />
                      <button
                        onClick={() => { setScreenshotUrls([]); setScreenshotStoragePaths([]); }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 border border-zinc-100 rounded-lg text-red-500 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Comandi Avanzati */}
              <div className="pt-4 border-t border-zinc-100">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full p-3 hover:bg-zinc-50 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg border transition-all", showAdvanced ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-400 border-zinc-100 group-hover:border-zinc-200")}>
                      <Settings size={14} />
                    </div>
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Comandi Avanzati</span>
                  </div>
                  {showAdvanced ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                </button>

                {showAdvanced && (
                  <div className="mt-6 space-y-10 pl-1 animate-in slide-in-from-top-4 duration-300">
                    {/* Colori Brand */}
                    <div className="space-y-4">
                      <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest pl-1">Personalizza Colori</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Accento</label>
                          {accentColor ? (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                               <div className="flex-1">
                                  <ColorInput value={accentColor} onChange={setAccentColor} />
                               </div>
                               <button 
                                  onClick={() => setAccentColor(null)} 
                                  className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                  title="Reset color"
                               >
                                  <X size={14} />
                               </button>
                            </div>
                          ) : (
                            <button 
                               onClick={() => setAccentColor('#3b82f6')} 
                               className="flex items-center gap-3 px-3 py-2 w-full bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-white transition-all group"
                            >
                               <div className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 group-hover:border-zinc-400 group-hover:text-zinc-600 transition-all">
                                  <Plus size={12} />
                               </div>
                               <span className="text-[10px] text-zinc-400 italic">Predefinito (AI)</span>
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Sfondo</label>
                          {bgColor ? (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                               <div className="flex-1">
                                  <ColorInput value={bgColor} onChange={setBgColor} />
                               </div>
                               <button 
                                  onClick={() => setBgColor(null)} 
                                  className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                  title="Reset color"
                               >
                                  <X size={14} />
                               </button>
                            </div>
                          ) : (
                            <button 
                               onClick={() => setBgColor('#ffffff')} 
                               className="flex items-center gap-3 px-3 py-2 w-full bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-white transition-all group"
                            >
                               <div className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 group-hover:border-zinc-400 group-hover:text-zinc-600 transition-all">
                                  <Plus size={12} />
                               </div>
                               <span className="text-[10px] text-zinc-400 italic">Predefinito (AI)</span>
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Testo</label>
                          {textColor ? (
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                               <div className="flex-1">
                                  <ColorInput value={textColor} onChange={setTextColor} />
                               </div>
                               <button 
                                  onClick={() => setTextColor(null)} 
                                  className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                                  title="Reset color"
                                >
                                  <X size={14} />
                                </button>
                            </div>
                          ) : (
                            <button 
                               onClick={() => setTextColor('#111111')} 
                               className="flex items-center gap-3 px-3 py-2 w-full bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-white transition-all group"
                            >
                               <div className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 group-hover:border-zinc-400 group-hover:text-zinc-600 transition-all">
                                  <Plus size={12} />
                               </div>
                               <span className="text-[10px] text-zinc-400 italic">Auto (AI)</span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-400 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50">
                         <Info size={10} className="inline mr-1 text-amber-500" />
                         Se imposti entrambi, i bottoni saranno automaticamente invertiti per il massimo contrasto.
                      </div>
                    </div>

                    {/* Tipografia */}
                    <div className="space-y-4 pt-4 border-t border-zinc-50">
                      <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest pl-1">Tipografia</label>
                      {fontFamily ? (
                        <div className="relative group/font">
                          <FontManager value={fontFamily} onChange={setFontFamily} />
                          <button onClick={() => setFontFamily(null)} className="absolute top-1.5 right-1.5 p-1 bg-white border border-zinc-100 rounded-lg text-zinc-300 hover:text-red-500 transition-all z-10 shadow-sm" title="Reset Font">
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setFontFamily('Outfit')}
                          className="flex items-center gap-3 px-3 py-2 w-full bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-white transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-all shrink-0">
                            <Plus size={12} />
                          </div>
                          <span className="text-[10px] text-zinc-400 italic">Predefinito (AI)</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Espaziatore per evitare che il dropdown del font venga tagliato */}
              {fontFamily !== null && <div className="h-48" />}
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
