'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ChevronDown, ChevronUp,
  Layers, Mail, MousePointer2,
  Palette, Play, Plus, Settings,
  Trash2, Type,
} from 'lucide-react';
import {
  AnchorManager,
  AnimationManager,
  BackgroundManager,
  BorderShadowManager,
  CategoryHeader,
  ColorManager,
  LayoutFields,
  ManagerWrapper,
  PatternManager,
  SimpleInput,
  SimpleSlider,
  TypographyFields,
  UnifiedSection as Section,
  useUnifiedSections,
} from '../SharedSidebarComponents';
import { ColorInput } from '../ui/ColorInput';
import type { FormField } from '@/components/blocks/visual/ContactFormBlock';

const MAX_FIELDS = 10;

const FIELD_TYPES: { value: FormField['type']; label: string }[] = [
  { value: 'text',     label: 'Testo' },
  { value: 'email',    label: 'Email' },
  { value: 'tel',      label: 'Telefono' },
  { value: 'number',   label: 'Numero' },
  { value: 'textarea', label: 'Testo lungo' },
  { value: 'select',   label: 'Scelta multipla' },
  { value: 'checkbox', label: 'Checkbox' },
];

interface ContactFormProps {
  selectedBlock: any;
  updateContent: (content: any) => void;
  updateStyle: (style: any) => void;
  getStyleValue: (key: string, defaultValue: any) => any;
  project: any;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  selectedBlock,
  updateContent,
  updateStyle,
  getStyleValue,
  project,
}) => {
  const content = selectedBlock.content;
  const { openSection, toggleSection } = useUnifiedSections();
  const fields: FormField[] = content.fields || [];
  const [expandedField, setExpandedField] = useState<number | null>(null);
  const [optionsDraft, setOptionsDraft] = useState<Record<string, string>>({});

  const addField = () => {
    if (fields.length >= MAX_FIELDS) return;
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: 'Campo',
      type: 'text',
      required: false,
      placeholder: '',
      width: 'full',
    };
    updateContent({ fields: [...fields, newField] });
    setExpandedField(fields.length);
  };

  const removeField = (index: number) => {
    updateContent({ fields: fields.filter((_: FormField, i: number) => i !== index) });
    setExpandedField(null);
  };

  const updateField = (index: number, patch: Partial<FormField>) => {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    updateContent({ fields: next });
  };

  const moveField = (index: number, dir: 'up' | 'down') => {
    if (dir === 'up' && index === 0) return;
    if (dir === 'down' && index === fields.length - 1) return;
    const next = [...fields];
    const target = dir === 'up' ? index - 1 : index + 1;
    [next[index], next[target]] = [next[target], next[index]];
    updateContent({ fields: next });
  };

  return (
    <div>
      {/* ── Web3Forms ── */}
      <CategoryHeader label="Impostazioni Form" />

      <Section icon={Mail} label="Web3Forms" id="settings" isOpen={openSection === 'settings'} onToggle={toggleSection}>
        {/* Step-by-step instructions */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-800 leading-relaxed space-y-1">
          <p className="font-bold">Come attivare il form in 3 passi:</p>
          <p>1. Vai su <strong>web3forms.com</strong></p>
          <p>2. Inserisci la tua email → ricevi link via email</p>
          <p>3. Clicca il link → copia l'<strong>Access Key</strong> e incollala qui</p>
          <p className="opacity-60 pt-1 border-t border-blue-200">Le notifiche arriveranno all'email che hai usato su web3forms. Piano gratuito: <strong>250 invii/mese</strong>.</p>
        </div>

        <SimpleInput
          label="Access Key"
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          value={content.accessKey || ''}
          onChange={(v) => updateContent({ accessKey: v })}
        />
        <SimpleInput
          label="Oggetto email notifica"
          placeholder="Nuovo messaggio dal sito"
          value={content.formSubject || ''}
          onChange={(v) => updateContent({ formSubject: v })}
        />
        <SimpleInput
          label="Messaggio di successo"
          placeholder="Grazie! Ti risponderemo presto."
          value={content.successMessage || ''}
          onChange={(v) => updateContent({ successMessage: v })}
        />
        <SimpleInput
          label="Messaggio di errore"
          placeholder="Errore nell'invio. Riprova più tardi."
          value={content.errorMessage || ''}
          onChange={(v) => updateContent({ errorMessage: v })}
        />
      </Section>

      {/* ── Componenti ── */}
      <CategoryHeader label="Componenti" />

      <Section icon={Type} label="Titolo" id="title" isOpen={openSection === 'title'} onToggle={toggleSection}>
        <SimpleInput
          label="Testo titolo"
          placeholder="es: Contattaci"
          value={content.title || ''}
          onChange={(v) => updateContent({ title: v })}
        />
        <SimpleInput
          label="Sottotitolo"
          placeholder="es: Siamo qui per aiutarti"
          value={content.subtitle || ''}
          onChange={(v) => updateContent({ subtitle: v })}
        />
        <TypographyFields
          label="Stile titolo"
          sizeKey="titleSize"
          boldKey="titleBold"
          italicKey="titleItalic"
          tagKey="titleTag"
          showTagSelector
          defaultTag="h2"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={40}
        />
      </Section>

      <Section
        icon={Type}
        label="Campi"
        id="fields"
        badge={`${fields.length}/${MAX_FIELDS}`}
        isOpen={openSection === 'fields'}
        onToggle={toggleSection}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Campi del form</label>
            <button
              onClick={addField}
              disabled={fields.length >= MAX_FIELDS}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all',
                fields.length >= MAX_FIELDS
                  ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed'
                  : 'bg-zinc-900 text-white hover:bg-zinc-800'
              )}
            >
              <Plus size={10} /> Aggiungi
            </button>
          </div>

          {fields.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">
                Nessun campo. Clicca aggiungi per iniziare.
              </p>
            </div>
          )}

          {fields.map((field, i) => (
            <div key={field.id || i} className="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              {/* Header */}
              <div
                className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
                onClick={() => setExpandedField(expandedField === i ? null : i)}
              >
                <div className="flex items-center gap-0.5">
                  <button onClick={(e) => { e.stopPropagation(); moveField(i, 'up'); }} disabled={i === 0} className="p-0.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-20">
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); moveField(i, 'down'); }} disabled={i === fields.length - 1} className="p-0.5 text-zinc-400 hover:text-zinc-900 disabled:opacity-20">
                    <ChevronDown size={12} />
                  </button>
                </div>
                <span className="flex-1 text-xs font-semibold text-zinc-700 truncate">
                  {field.label || `Campo ${i + 1}`}
                  <span className="ml-1.5 text-[10px] font-normal text-zinc-400">
                    {FIELD_TYPES.find(t => t.value === field.type)?.label}
                    {field.required ? ' · obbligatorio' : ''}
                  </span>
                </span>
                <button onClick={(e) => { e.stopPropagation(); removeField(i); }} className="p-1 text-zinc-300 hover:text-red-500 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Expanded editor */}
              {expandedField === i && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-zinc-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block">Etichetta</label>
                    <input
                      className="w-full px-3 py-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all"
                      value={field.label}
                      onChange={(e) => updateField(i, { label: e.target.value })}
                      placeholder="Nome campo..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block">Tipo</label>
                    <select
                      className="w-full px-3 py-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all"
                      value={field.type}
                      onChange={(e) => updateField(i, { type: e.target.value as FormField['type'] })}
                    >
                      {FIELD_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {field.type !== 'checkbox' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block">Placeholder</label>
                      <input
                        className="w-full px-3 py-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(i, { placeholder: e.target.value })}
                        placeholder="Testo suggerito..."
                      />
                    </div>
                  )}

                  {field.type === 'select' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block">
                        Opzioni <span className="normal-case font-normal">(separate da virgola)</span>
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-zinc-100 rounded-xl text-xs bg-zinc-50 focus:bg-white focus:border-zinc-900 outline-none transition-all"
                        value={optionsDraft[field.id] ?? (field.options || []).join(', ')}
                        onChange={(e) => setOptionsDraft((d) => ({ ...d, [field.id]: e.target.value }))}
                        onBlur={(e) => {
                          updateField(i, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) });
                          setOptionsDraft((d) => { const n = { ...d }; delete n[field.id]; return n; });
                        }}
                        placeholder="Opzione 1, Opzione 2, Opzione 3"
                      />
                    </div>
                  )}

                  {field.type !== 'textarea' && field.type !== 'checkbox' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block">Larghezza</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['full', 'half'] as const).map((w) => (
                          <button
                            key={w}
                            onClick={() => updateField(i, { width: w })}
                            className={cn(
                              'py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all',
                              field.width === w
                                ? 'border-zinc-900 bg-zinc-900 text-white'
                                : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'
                            )}
                          >
                            {w === 'full' ? 'Intera' : 'Metà'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(i, { required: e.target.checked })}
                      className="w-3.5 h-3.5 accent-zinc-900"
                    />
                    <span className="text-[11px] font-medium text-zinc-600">Campo obbligatorio</span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section icon={MousePointer2} label="Pulsante Invio" id="submit" isOpen={openSection === 'submit'} onToggle={toggleSection}>
        {/* Label */}
        <SimpleInput
          label="Testo pulsante"
          placeholder="Invia messaggio"
          value={content.submit || ''}
          onChange={(v) => updateContent({ submit: v })}
        />

        {/* Theme selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-zinc-400 uppercase block">Stile</label>
          <div className="grid grid-cols-3 bg-zinc-100 p-1 rounded-2xl gap-1">
            {(['primary', 'secondary', 'custom'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateContent({ submitTheme: t })}
                className={cn(
                  'px-1 py-2 text-[9px] font-black uppercase tracking-tighter rounded-xl transition-all',
                  (content.submitTheme || 'primary') === t
                    ? 'bg-zinc-900 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-zinc-600'
                )}
              >
                {t === 'primary' ? 'Primary' : t === 'secondary' ? 'Secondary' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Custom overrides */}
        {content.submitTheme === 'custom' && (
          <div className="space-y-4 pt-2 border-t border-zinc-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-3">
              <ColorInput
                label="Sfondo"
                value={getStyleValue('submitBgColor', '#3b82f6')}
                onChange={(v) => updateStyle({ submitBgColor: v })}
              />
              <ColorInput
                label="Testo"
                value={getStyleValue('submitTextColor', '#ffffff')}
                onChange={(v) => updateStyle({ submitTextColor: v })}
              />
            </div>
            <SimpleSlider
              label="Arrotondamento"
              value={getStyleValue('submitRadius', 24)}
              onChange={(v: number) => updateStyle({ submitRadius: v })}
              min={0} max={50} step={1}
            />
            <SimpleSlider
              label="Padding orizzontale"
              value={getStyleValue('submitPaddingX', 32)}
              onChange={(v: number) => updateStyle({ submitPaddingX: v })}
              min={8} max={80} step={2}
            />
            <SimpleSlider
              label="Padding verticale"
              value={getStyleValue('submitPaddingY', 12)}
              onChange={(v: number) => updateStyle({ submitPaddingY: v })}
              min={4} max={40} step={1}
            />
          </div>
        )}
      </Section>

      {/* ── Stile ── */}
      <CategoryHeader label="Stile della Sezione" />

      <Section icon={Layers} label="Layout & Spaziatura" id="layout" isOpen={openSection === 'layout'} onToggle={toggleSection}>
        <LayoutFields getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Type} label="Tipografia" id="typography" isOpen={openSection === 'typography'} onToggle={toggleSection}>
        <TypographyFields
          label="Titolo"
          sizeKey="titleSize"
          boldKey="titleBold"
          italicKey="titleItalic"
          tagKey="titleTag"
          showTagSelector
          defaultTag="h2"
          getStyleValue={getStyleValue}
          updateStyle={updateStyle}
          defaultValue={40}
        />
        <SimpleSlider
          label="Dimensione etichette campi"
          value={getStyleValue('labelSize', 14)}
          onChange={(v: number) => updateStyle({ labelSize: v })}
          min={10} max={22} step={1}
        />
      </Section>

      <Section icon={Palette} label="Sfondo & Colori" id="background" isOpen={openSection === 'background'} onToggle={toggleSection}>
        <ColorManager getStyleValue={getStyleValue} updateStyle={updateStyle} project={project} showTitle={false} />
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Immagine Sfondo">
          <BackgroundManager
            selectedBlock={selectedBlock}
            updateContent={updateContent}
            updateStyle={updateStyle}
            getStyleValue={getStyleValue}
          />
        </ManagerWrapper>
        <div className="h-px bg-zinc-100 my-1" />
        <ManagerWrapper label="Pattern Decorativo">
          <PatternManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        </ManagerWrapper>
      </Section>

      <Section icon={Play} label="Animazioni" id="animation" isOpen={openSection === 'animation'} onToggle={toggleSection}>
        <AnimationManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
      </Section>

      <Section icon={Settings} label="Avanzate" id="advanced" isOpen={openSection === 'advanced'} onToggle={toggleSection}>
        <BorderShadowManager getStyleValue={getStyleValue} updateStyle={updateStyle} />
        <AnchorManager selectedBlock={selectedBlock} updateContent={updateContent} />
      </Section>
    </div>
  );
};
