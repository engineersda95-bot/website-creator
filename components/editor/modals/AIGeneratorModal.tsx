'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Layout, Type, Settings as SettingsIcon, Mic, MicOff, Plus, Loader2, Sparkles, Wand2, Info, Image as ImageIcon, CheckCircle2, AlertCircle, X, ChevronRight, ChevronLeft } from 'lucide-react';
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

type Step = 'intro' | 'info' | 'description' | 'extra-pages' | 'validation' | 'style' | 'generating';

export function AIGeneratorModal({ onClose, onSuccess, user }: AIGeneratorModalProps) {
  const [step, setStep] = useState<Step>('intro');
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
  const [extraPages, setExtraPages] = useState<{ name: string; description: string }[]>([]);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDesc, setNewPageDesc] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationQuestions, setValidationQuestions] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'auto'>('auto');
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string | null>(null);


  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const ext = file.name.split('.').pop();
      const filename = `logo-${Date.now()}.${ext}`;
      const path = `ai-temp/${user.id}/${filename}`;
      
      const { data, error } = await supabase.storage
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

    setIsUploading(true);
    for (const file of Array.from(files)) {
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
        setStep('style');
      } else {
        setValidationQuestions(result.questions);
        setStep('validation');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setStep('style'); // Fallback
    } finally {
      setIsValidating(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 'intro') setStep('info');
    else if (step === 'info') setStep('description');
    else if (step === 'description') setStep('extra-pages');
    else if (step === 'extra-pages') {
      // UX Improvement: If user entered data but forgot to click 'Add', do it for them
      if (newPageName.trim() && newPageDesc.trim()) {
        const updatedPages = [...extraPages, { name: newPageName.trim(), description: newPageDesc.trim() }];
        setExtraPages(updatedPages);
        setNewPageName('');
        setNewPageDesc('');
        await runValidation(updatedPages);
      } else {
        await runValidation(extraPages);
      }
    }
    else if (step === 'validation') setStep('style');
  };

  const handleValidationAnswer = (id: string, value: string) => {
    // Append answer to description to give context to Gemini
    const q = validationQuestions.find(v => v.id === id);
    if (q) {
      setDescription(prev => (prev + '\n\n- ' + q.question + ': ' + value));
      setValidationQuestions(prev => prev.filter(v => v.id !== id));
      if (validationQuestions.length === 1) {
        setStep('style');
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
    setStep('generating');
    
    // Simulate progress phases
    const interval = setInterval(() => {
      setProgress(p => (p < 90 ? p + Math.random() * 10 : p));
    }, 2000);

    try {
      const socials = [
        { platform: 'instagram', url: instagram },
        { platform: 'facebook', url: facebook },
        { platform: 'whatsapp', url: whatsapp },
        { platform: 'x', url: twitter },
        { platform: 'linkedin', url: linkedin }
      ].filter(s => s.url);

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
        appearance: appearance === 'auto' ? undefined : appearance
      });

      clearInterval(interval);
      if (result.success) {
        setProgress(100);
        setTimeout(() => {
          onSuccess({
            ...result.data,
            businessName // Pass business name back for project naming
          });
        }, 800);
      } else {
        setError(result.error || 'Errore imprevisto');
        setStep('style');
        setIsGenerating(false);
      }
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'Errore tecnico');
      setStep('style');
      setIsGenerating(false);
    }
  };

  const addPage = () => {
    if (newPageName.trim() && newPageDesc.trim()) {
      setExtraPages([...extraPages, { name: newPageName.trim(), description: newPageDesc.trim() }]);
      setNewPageName('');
      setNewPageDesc('');
    }
  };

  const removePage = (idx: number) => {
    setExtraPages(extraPages.filter((_, i) => i !== idx));
  };

  const removeScreenshot = (idx: number) => {
    setScreenshotUrls(screenshotUrls.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 border border-zinc-200 h-full max-h-[90vh] overflow-visible">
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg shadow-zinc-200">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900 tracking-tight">Crea con IA</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Generatore Magico</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-xl transition-all text-zinc-400 hover:text-zinc-600 active:scale-90">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 overflow-x-visible">
          
          {step === 'intro' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-4 py-4">
                <div className="inline-flex p-4 rounded-3xl bg-zinc-50 border border-zinc-100 mb-2">
                   <Wand2 className="text-zinc-900" size={32} />
                </div>
                <h3 className="text-2xl font-black text-zinc-900">Il tuo sito pronto in 60 secondi</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
                  Descrivi la tua attività e la nostra IA genererà struttura, testi e design su misura per te.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Type, title: "Testi Professionali", desc: "Copywriting ottimizzato per la conversione" },
                  { icon: Layout, title: "Struttura Multi-page", desc: "Fino a 5 pagine generate istantaneamente" },
                  { icon: Palette, title: "Design Personalizzato", desc: "Colori e font estratti dai tuoi screenshot" }
                ].map((feature, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <feature.icon className="text-zinc-400 mb-3" size={20} />
                    <h4 className="text-[12px] font-bold text-zinc-900 uppercase tracking-wider mb-1">{feature.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-tight">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setStep('info')}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 group hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-[0.98]"
                >
                  Inizia la Generazione
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 'info' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 px-1">Nome dell'Attività</label>
                    <input 
                      autoFocus
                      value={businessName}
                      onChange={e => setBusinessName(e.target.value)}
                      placeholder="Es: Pizzeria da Mario"
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all font-bold text-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 px-1">Lingua Generazione</label>
                    <select 
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-zinc-900 appearance-none cursor-pointer"
                    >
                      <option value="it">🇮🇹 Italiano</option>
                      <option value="en">🇺🇸 English</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="fr">🇫🇷 Français</option>
                      <option value="de">🇩🇪 Deutsch</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Settore</label>
                  <select 
                    value={businessType}
                    onChange={e => setBusinessType(e.target.value)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-zinc-900 appearance-none cursor-pointer"
                  >
                    {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Email</label>
                    <input 
                      value={businessEmail}
                      onChange={e => setBusinessEmail(e.target.value)}
                      placeholder="info@azienda.it"
                      className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Telefono</label>
                    <input 
                      value={businessPhone}
                      onChange={e => setBusinessPhone(e.target.value)}
                      placeholder="+39 012 3456789"
                      className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1">Indirizzo Sede (Opzionale)</label>
                    <input 
                      value={businessAddress}
                      onChange={e => setBusinessAddress(e.target.value)}
                      placeholder="Via Roma 123"
                      className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <input 
                        value={businessZip}
                        onChange={e => setBusinessZip(e.target.value)}
                        placeholder="CAP"
                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold"
                      />
                    </div>
                    <div className="col-span-2">
                      <input 
                        value={businessCity}
                        onChange={e => setBusinessCity(e.target.value)}
                        placeholder="Città"
                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 px-1">Social Links (Opzionale)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Instagram URL" className="px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] focus:bg-white outline-none font-bold" />
                    <input value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="Facebook URL" className="px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] focus:bg-white outline-none font-bold" />
                    <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp" className="px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] focus:bg-white outline-none font-bold" />
                    <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="X (Twitter) URL" className="px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] focus:bg-white outline-none font-bold" />
                    <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className="px-4 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] focus:bg-white outline-none font-bold" />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 px-1 italic">Logo aziendale (Opzionale)</label>
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 border border-zinc-100 rounded-3xl group hover:border-zinc-200 transition-all relative cursor-pointer overflow-hidden">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    />
                    <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-zinc-300" size={24} />
                      ) : businessLogoUrl ? (
                        <img src={businessLogoUrl} className="w-full h-full object-contain" alt="Logo preview" />
                      ) : (
                        <ImageIcon className="text-zinc-200" size={24} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-zinc-900 group-hover:text-zinc-600">Carica il tuo logo</div>
                      <div className="text-[10px] text-zinc-400">Dimensione consigliata: 512x512px</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                 <button onClick={() => setStep('intro')} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold hover:bg-zinc-200 transition-all">
                    Indietro
                 </button>
                 <button 
                   disabled={!businessName.trim()}
                   onClick={handleNextStep} 
                   className="flex-[2] py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
                 >
                    Prossimo
                 </button>
              </div>
            </div>
          )}

          {step === 'description' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">Descrizione del Progetto</label>
                    <div className="group relative">
                      <Info size={14} className="text-zinc-300 cursor-help hover:text-zinc-500 transition-colors" />
                      <div className="absolute bottom-full right-0 mb-3 w-64 p-4 bg-zinc-900 text-white text-[11px] rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 leading-relaxed italic border border-zinc-800">
                        Raccontaci cosa vuoi mettere in evidenza (es: per un ristorante parla del menu, orari, location e CTA principale come prenotazioni). Più dettagli dai, migliore sarà il risultato.
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea 
                      autoFocus
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Descrivi cosa fa la tua attività, i punti di forza, i prodotti principali e l'obiettivo del sito..."
                      className="w-full h-48 px-6 py-5 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all font-medium text-zinc-900 resize-none leading-relaxed"
                    />
                    <button 
                      onClick={() => toggleListening('description')}
                      className={cn(
                        "absolute bottom-4 right-4 p-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2",
                        isListening ? "bg-red-500 text-white animate-pulse scale-110" : "bg-white text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 border border-zinc-100"
                      )}
                      title={isListening ? "Ferma ascolto" : "Dettatura vocale"}
                    >
                      {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                      {isListening && <span className="text-[10px] font-black uppercase tracking-tighter">Ascolto...</span>}
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-2 px-1">
                     <span className="text-[10px] text-zinc-400 font-bold italic">Min. 50 caratteri consigliati</span>
                     <span className={cn("text-[10px] font-black tracking-widest", description.length < 50 ? "text-amber-500" : "text-emerald-500")}>
                       {description.length} caratteri
                     </span>
                  </div>
               </div>

               <div className="pt-2 flex gap-3">
                 <button onClick={() => setStep('info')} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold hover:bg-zinc-200 transition-all">
                    Indietro
                 </button>
                 <button 
                   disabled={description.length < 10}
                   onClick={handleNextStep} 
                   className="flex-[2] py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50"
                 >
                    Prossimo Step
                 </button>
              </div>
            </div>
          )}

          {step === 'style' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Screenshots Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Palette size={14} className="text-zinc-400" />
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Personalizza lo stile (Opzionale)</label>
                </div>
                
                <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-3xl p-6 text-center group hover:border-zinc-400 transition-all relative overflow-hidden">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform">
                      <ImageIcon className="text-zinc-300" size={24} />
                    </div>
                    <div>
                      <h5 className="text-[12px] font-bold text-zinc-800">Carica screenshot di riferimento</h5>
                      <p className="text-[10px] text-zinc-400">L'IA estrarrà colori, font e layout da questi file</p>
                    </div>
                  </div>
                </div>

                {screenshotUrls.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {screenshotUrls.map((s, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 shadow-sm group/thumb">
                        <img src={s} className="w-full h-full object-cover" alt={`Preview ${i}`} />
                        <button 
                          onClick={() => removeScreenshot(i)}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-md opacity-0 group-hover/thumb:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>


              {/* Advanced Settings */}
              <div className="border border-zinc-100 rounded-3xl overflow-hidden mt-4">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-zinc-50/50 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SettingsIcon size={14} className="text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Impostazioni Avanzate Stile</span>
                  </div>
                  <Plus size={14} className={cn("text-zinc-400 transition-transform duration-300", showAdvanced && "rotate-45")} />
                </button>

                {showAdvanced && (
                  <div className="p-6 bg-white space-y-6 border-t border-zinc-100 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tema</label>
                        <select 
                          value={appearance}
                          onChange={e => setAppearance(e.target.value as any)}
                          className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs font-bold outline-none focus:border-zinc-900 transition-all cursor-pointer"
                        >
                          <option value="auto">🤖 IA Decide (Auto)</option>
                          <option value="light">☀️ Chiaro</option>
                          <option value="dark">🌙 Scuro</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Colore Primario</label>
                        {primaryColor === null ? (
                          <button 
                            onClick={() => setPrimaryColor('#000000')}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] font-bold text-zinc-400 text-left hover:border-zinc-300 transition-all italic"
                          >
                            Consigliato dall'IA - Scegli per forzare
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-2xl group/color">
                            <input 
                              type="color" 
                              value={primaryColor} 
                              onChange={e => setPrimaryColor(e.target.value)}
                              className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border-none bg-transparent"
                            />
                            <input 
                              type="text" 
                              value={primaryColor}
                              onChange={e => setPrimaryColor(e.target.value)}
                              className="flex-1 bg-transparent text-[11px] font-mono font-bold text-zinc-600 outline-none"
                            />
                            <button onClick={() => setPrimaryColor(null)} className="p-1 opacity-0 group-hover/color:opacity-100 transition-opacity">
                              <X size={12} className="text-zinc-300" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Colore Sfondo/Sec.</label>
                        {secondaryColor === null ? (
                          <button 
                            onClick={() => setSecondaryColor('#ffffff')}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] font-bold text-zinc-400 text-left hover:border-zinc-300 transition-all italic"
                          >
                            Consigliato dall'IA - Scegli per forzare
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-100 rounded-2xl group/color">
                            <input 
                              type="color" 
                              value={secondaryColor} 
                              onChange={e => setSecondaryColor(e.target.value)}
                              className="w-8 h-8 rounded-lg overflow-hidden cursor-pointer border-none bg-transparent"
                            />
                            <input 
                              type="text" 
                              value={secondaryColor}
                              onChange={e => setSecondaryColor(e.target.value)}
                              className="flex-1 bg-transparent text-[11px] font-mono font-bold text-zinc-600 outline-none"
                            />
                            <button onClick={() => setSecondaryColor(null)} className="p-1 opacity-0 group-hover/color:opacity-100 transition-opacity">
                              <X size={12} className="text-zinc-300" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Font Principale</label>
                        {fontFamily === null ? (
                          <button 
                            onClick={() => setFontFamily('Inter')}
                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl text-[11px] font-bold text-zinc-400 text-left hover:border-zinc-300 transition-all italic"
                          >
                            Scelta dall'IA - Clicca per selezionare
                          </button>
                        ) : (
                          <div className="relative group/font">
                            <FontManager 
                              value={fontFamily}
                              onChange={setFontFamily}
                              label="Font Principale"
                            />
                            <button 
                              onClick={() => setFontFamily(null)} 
                              className="absolute top-0 right-1 p-1 text-zinc-300 hover:text-zinc-900 transition-all"
                              title="Reset all'IA"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Padding per evitare che il dropdown tagli */}
                    <div className="h-40" />
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                 <button onClick={() => setStep('extra-pages')} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold hover:bg-zinc-200 transition-all font-black text-[12px] uppercase">
                    Indietro
                 </button>
                 <button 
                   onClick={handleStartGeneration} 
                   className="flex-[2] py-4 bg-zinc-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 active:scale-95 group"
                 >
                    <Sparkles className="group-hover:rotate-12 transition-transform" size={18} />
                    Genera con IA
                 </button>
              </div>
            </div>
          )}

          {step === 'extra-pages' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Layout size={14} className="text-zinc-400" />
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Pagine Aggiuntive</label>
                </div>

                <div className="space-y-3">
                  <input 
                    value={newPageName}
                    onChange={e => setNewPageName(e.target.value)}
                    placeholder="Nome della pagina (es: Servizi, Portfolio...)"
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addPage();
                      }
                    }}
                  />
                  <div className="relative">
                    <textarea 
                      value={newPageDesc}
                      onChange={e => setNewPageDesc(e.target.value)}
                      placeholder="Descrivi l'obiettivo di questa pagina..."
                      className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl text-xs focus:bg-white focus:border-zinc-900 outline-none transition-all font-medium h-32 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          addPage();
                        }
                      }}
                    />
                    <button 
                      onClick={() => toggleListening('extra')}
                      className={cn(
                        "absolute bottom-4 right-4 p-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2",
                        isListening ? "bg-red-500 text-white animate-pulse" : "bg-white text-zinc-400 hover:text-zinc-900 border border-zinc-100"
                      )}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                  </div>
                  <button 
                    disabled={!newPageName.trim() || !newPageDesc.trim()}
                    onClick={addPage}
                    className="w-full py-3 bg-zinc-900/5 hover:bg-zinc-900/10 text-zinc-900 rounded-2xl font-bold transition-all disabled:opacity-50 text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Aggiungi Pagina
                  </button>
                </div>

                {extraPages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {extraPages.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest group/page" title={p.description}>
                        <span>{p.name}</span>
                        <button onClick={() => removePage(i)} className="p-0.5 hover:bg-white/20 rounded-full transition-colors">
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                 <button onClick={() => setStep('description')} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold hover:bg-zinc-200 transition-all font-black text-[12px] uppercase">
                    Indietro
                 </button>
                 <button 
                   disabled={isValidating}
                   onClick={handleNextStep} 
                   className="flex-[2] py-4 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                    {isValidating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Analisi...
                      </>
                    ) : 'Analizza e Continua'}
                 </button>
              </div>
            </div>
          )}

          {step === 'validation' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <h3 className="text-xl font-black text-zinc-900 italic">Un paio di domande...</h3>
                <p className="text-zinc-400 text-xs font-medium">Abbiamo analizzato la tua richiesta. Per un risultato perfetto abbiamo bisogno di qualche dettaglio in più.</p>
              </div>

              <div className="space-y-6 pt-2">
                {validationQuestions.map((q, i) => (
                  <div key={q.id || `q-${i}`} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                    <label className="block text-[11px] font-black text-zinc-900 uppercase tracking-wider px-1">
                      {q.question || q.text || `Domanda per ${businessName}`}
                    </label>
                    <input 
                      autoFocus={i === 0}
                      placeholder={q.placeholder || "Scrivi qui la risposta..."}
                      className="w-full px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:bg-white focus:border-zinc-900 outline-none transition-all font-bold text-zinc-900"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleValidationAnswer(q.id || `q-${i}`, (e.target as HTMLInputElement).value);
                        }
                      }}
                    />
                  </div>
                ))}
                {(!validationQuestions || validationQuestions.length === 0) && (
                   <div className="p-12 text-center text-zinc-400 text-sm italic py-8 bg-zinc-50 rounded-3xl border border-zinc-100 animate-pulse">
                      Abbiamo tutto! Clicca su continua per procedere...
                      {setTimeout(() => setStep('style'), 1500) && null}
                   </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                 <button onClick={() => setStep('description')} className="flex-1 py-4 bg-zinc-100 text-zinc-500 rounded-2xl font-bold hover:bg-zinc-200 transition-all font-black text-[12px] uppercase tracking-widest">
                    Modifica
                 </button>
                 <button 
                   onClick={() => setStep('style')} 
                   className="flex-[2] py-4 bg-zinc-900 text-white rounded-2xl font-black hover:bg-zinc-800 transition-all text-[12px] uppercase tracking-widest"
                 >
                    Salta e Continua
                 </button>
              </div>
            </div>
          )}

          {step === 'generating' && (
            <div className="py-12 space-y-12 animate-in fade-in zoom-in-95 duration-500">
               <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center animate-pulse">
                        <Wand2 size={40} className="text-zinc-900 animate-bounce" />
                    </div>
                    <div className="absolute -top-2 -right-2 p-2 bg-zinc-900 text-white rounded-2xl shadow-lg border-4 border-white">
                      <Sparkles size={16} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-900 italic">Creazione della Magia...</h3>
                    <p className="text-zinc-400 text-sm font-medium">L'IA sta scrivendo i testi e progettando il layout.</p>
                  </div>
               </div>

               <div className="space-y-4 max-w-sm mx-auto">
                  <div className="h-3 bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-200/50 shadow-inner">
                    <div 
                      className="h-full bg-zinc-900 rounded-full transition-all duration-500 relative overflow-hidden" 
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 italic">
                    <span>
                       {progress < 30 ? 'Analisi contesto...' : 
                        progress < 60 ? 'Progettazione layout...' : 
                        progress < 90 ? 'Stesura contenuti...' : 'Finalizzazione...'}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
               </div>

               {error && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div className="text-xs text-red-600 font-medium leading-relaxed">{error}</div>
                 </div>
               )}
            </div>
          )}

        </div>
        
        {/* Footer (Steps Indicator) */}
        {!isGenerating && (
          <div className="px-8 py-4 border-t border-zinc-100 bg-zinc-50/30 flex items-center justify-between">
            <div className="flex gap-2">
              {(['intro', 'info', 'description', 'extra-pages', 'validation', 'style'] as Step[]).map((s, i) => (
                <div 
                  key={s} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    step === s ? "w-8 bg-zinc-900" : "w-1.5 bg-zinc-200"
                  )} 
                />
              ))}
            </div>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
               SitiVetrina v2.5 AI
            </div>
          </div>
        )}
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
