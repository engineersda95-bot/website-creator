import React from 'react';
import { Block, Project } from '@/types/editor';
import { formatRichText } from '@/lib/utils';
import { getBlockStyles } from '@/lib/hooks/useBlockStyles';
import { getButtonStyle, getButtonClass } from '@/lib/utils';
import { BlockBackground } from '@/components/shared/BlockBackground';
import { InlineEditable } from '@/components/shared/InlineEditable';
import { getCTAOverrides } from '@/components/shared/CTA';

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox';
  required: boolean;
  placeholder?: string;
  width: 'full' | 'half';
  options?: string[];
}

interface ContactFormBlockProps {
  block: Block;
  project?: Project;
  viewport?: 'desktop' | 'tablet' | 'mobile';
  isStatic?: boolean;
  imageMemoryCache?: Record<string, string>;
  onInlineEdit?: (field: string, value: string) => void;
}

// Scoped CSS: hide number spinners
const CF_STYLE = `.cf-block input[type=number]::-webkit-inner-spin-button,.cf-block input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.cf-block input[type=number]{-moz-appearance:textfield}`;

// Combined script: custom selects + Web3Forms AJAX
// On success: reset form, show inline message (form stays visible)
const W3F_SCRIPT = `(function(){
  // Custom select dropdowns
  function cfShow(drop){drop.style.opacity='0';drop.style.transform='translateY(-6px)';drop.style.pointerEvents='none';drop.style.visibility='visible';requestAnimationFrame(function(){drop.style.transition='opacity 0.15s,transform 0.15s';drop.style.opacity='1';drop.style.transform='translateY(0)';drop.style.pointerEvents='auto';});}
  function cfHide(drop){drop.style.transition='opacity 0.12s,transform 0.12s';drop.style.opacity='0';drop.style.transform='translateY(-6px)';drop.style.pointerEvents='none';setTimeout(function(){if(drop.style.opacity==='0')drop.style.visibility='hidden';},130);}
  document.querySelectorAll('[data-cf-select]').forEach(function(wrap){
    var sel=wrap.querySelector('select'),disp=wrap.querySelector('[data-cf-disp]'),drop=wrap.querySelector('[data-cf-drop]');
    if(!sel||!disp||!drop)return;
    var isOpen=false;
    disp.addEventListener('click',function(e){
      e.stopPropagation();
      isOpen=!isOpen;
      isOpen?cfShow(drop):cfHide(drop);
      disp.setAttribute('data-open',isOpen?'true':'false');
    });
    drop.querySelectorAll('[data-cf-opt]').forEach(function(o){
      o.addEventListener('mouseenter',function(){o.style.background='color-mix(in srgb, currentColor 7%, transparent)';});
      o.addEventListener('mouseleave',function(){o.style.background=o.hasAttribute('data-sel')?'color-mix(in srgb, currentColor 5%, transparent)':'';});
      o.addEventListener('click',function(){
        var v=o.getAttribute('data-cf-opt');
        sel.value=v;
        var valEl=disp.querySelector('[data-cf-val]');
        if(valEl){valEl.textContent=o.querySelector('[data-cf-label]').textContent;valEl.style.opacity='1';}
        drop.querySelectorAll('[data-cf-opt]').forEach(function(x){
          x.removeAttribute('data-sel');
          x.style.background='';
          var ck=x.querySelector('[data-cf-check]');if(ck)ck.style.opacity='0';
        });
        o.setAttribute('data-sel','');
        o.style.background='color-mix(in srgb, currentColor 5%, transparent)';
        var ck=o.querySelector('[data-cf-check]');if(ck)ck.style.opacity='1';
        isOpen=false;cfHide(drop);
        disp.setAttribute('data-open','false');
      });
    });
    document.addEventListener('click',function(){if(isOpen){isOpen=false;cfHide(drop);disp.setAttribute('data-open','false');}});
  });
  // Web3Forms submission
  if(window._w3fi)return;window._w3fi=1;
  document.querySelectorAll('form[data-w3f]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var btn=f.querySelector('[data-w3f-btn]'),succ=f.querySelector('[data-w3f-success]'),err=f.querySelector('[data-w3f-error]');
      if(err)err.style.display='none';
      if(succ)succ.style.display='none';
      if(btn){btn.disabled=true;btn.style.opacity='0.6';}
      fetch('https://api.web3forms.com/submit',{method:'POST',body:new FormData(f)})
        .then(function(r){return r.json();})
        .then(function(d){
          if(d.success){
            f.reset();
            // Reset custom select displays
            f.querySelectorAll('[data-cf-select]').forEach(function(wrap){
              var ph=wrap.getAttribute('data-cf-ph')||'Seleziona...';
              var v=wrap.querySelector('[data-cf-val]');
              if(v){v.textContent=ph;v.style.opacity='0.5';}
              wrap.querySelectorAll('[data-cf-opt]').forEach(function(o){o.removeAttribute('data-sel');});
            });
            if(succ)succ.style.display='';
          }else{
            if(err)err.style.display='';
          }
          if(btn){btn.disabled=false;btn.style.opacity='';}
        })
        .catch(function(){
          if(err)err.style.display='';
          if(btn){btn.disabled=false;btn.style.opacity='';}
        });
    });
  });
})();`;

const inputBase: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid',
  borderColor: 'color-mix(in srgb, currentColor 15%, transparent)',
  borderRadius: '8px',
  background: 'color-mix(in srgb, currentColor 6%, var(--block-bg, #ffffff))',
  color: 'inherit',
  fontSize: 'var(--cf-label-fs)',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box' as const,
};

// Chevron SVG for select
const ChevronSVG = () => (
  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
    <path d="M1 1L6 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const renderField = (field: FormField, index: number, isStatic?: boolean) => {
  const alwaysFull = field.type === 'textarea' || field.type === 'checkbox';
  const colSpan = alwaysFull || field.width === 'full' ? 'span 2' : 'span 1';
  // Use field.label as name so Web3Forms shows the readable label in the email
  const fieldName = field.label || field.id;

  let input: React.ReactNode;

  if (field.type === 'textarea') {
    input = (
      <textarea
        name={fieldName}
        placeholder={field.placeholder || ''}
        required={field.required}
        rows={4}
        maxLength={3000}
        style={{ ...inputBase, resize: 'none' }}
      />
    );
  } else if (field.type === 'select') {
    const ph = field.placeholder || "Seleziona un'opzione...";
    if (isStatic) {
      const opts = field.options || [];
      input = (
        <div data-cf-select="" data-cf-ph={ph} style={{ position: 'relative' }}>
          {/* Hidden native select for FormData serialization */}
          <select
            name={fieldName}
            required={field.required}
            style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none', zIndex: -1 }}
            tabIndex={-1}
          >
            <option value="">{ph}</option>
            {opts.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
          </select>

          {/* Trigger */}
          <div
            data-cf-disp=""
            data-open="false"
            style={{
              ...inputBase,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              userSelect: 'none' as const,
              transition: 'border-color 0.2s',
            }}
          >
            <span data-cf-val="" style={{ opacity: 0.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{ph}</span>
            {/* Animated chevron via JS data-open attr */}
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ flexShrink: 0, opacity: 0.4, transition: 'transform 0.2s' }}>
              <path d="M1 1L6 7L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Dropdown panel */}
          <div
            data-cf-drop=""
            style={{
              visibility: 'hidden' as const,
              opacity: 0,
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: 'var(--block-bg, #fff)',
              border: '1.5px solid',
              borderColor: 'color-mix(in srgb, currentColor 14%, transparent)',
              borderRadius: '10px',
              overflow: 'hidden',
              zIndex: 300,
              boxShadow: '0 12px 32px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {opts.map((opt, i) => (
              <div
                key={i}
                data-cf-opt={opt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  cursor: 'pointer',
                  fontSize: 'var(--cf-label-fs)',
                  color: 'var(--block-color)',
                  borderBottom: i < opts.length - 1 ? '1px solid' : 'none',
                  borderColor: 'color-mix(in srgb, currentColor 7%, transparent)',
                  transition: 'background 0.1s',
                }}
              >
                <span data-cf-label="">{opt}</span>
                {/* Checkmark — shown when selected */}
                <svg data-cf-check="" width="14" height="11" viewBox="0 0 14 11" fill="none" style={{ opacity: 0, flexShrink: 0, transition: 'opacity 0.15s' }}>
                  <path d="M1 5.5L5 9.5L13 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      // Editor: static-looking preview div (native select has unreliable styling)
      input = (
        <div
          style={{
            ...inputBase,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            cursor: 'default',
            userSelect: 'none' as const,
          }}
        >
          <span style={{ opacity: 0.45, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ph}</span>
          <ChevronSVG />
        </div>
      );
    }
  } else if (field.type === 'checkbox') {
    input = (
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: 'var(--cf-label-fs)' }}>
        <input
          type="checkbox"
          name={fieldName}
          required={field.required}
          style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'currentColor', flexShrink: 0 }}
        />
        <span style={{ opacity: 0.75 }}>
          <span dangerouslySetInnerHTML={{ __html: formatRichText(field.label) }} />
          {field.required && <span style={{ opacity: 0.5, marginLeft: '3px' }}>*</span>}
        </span>
      </label>
    );
  } else {
    input = (
      <input
        type={field.type}
        name={fieldName}
        placeholder={field.placeholder || ''}
        required={field.required}
        maxLength={255}
        style={inputBase}
      />
    );
  }

  return (
    <div key={field.id || index} style={{ gridColumn: colSpan, display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {field.type !== 'checkbox' && (
        <label style={{ fontSize: 'var(--cf-label-fs)', fontWeight: 600, opacity: 0.8 }}>
          {field.label}
          {field.required && <span style={{ opacity: 0.4, marginLeft: '3px' }}>*</span>}
        </label>
      )}
      {input}
    </div>
  );
};

export const ContactFormBlock: React.FC<ContactFormBlockProps> = ({
  block, project, viewport, isStatic, onInlineEdit,
}) => {
  const { content } = block;
  const { style } = getBlockStyles(block, project, viewport || 'desktop');
  const fields: FormField[] = content.fields || [];

  const hasTitle = content.title && content.title.replace(/<[^>]*>/g, '').trim().length > 0;
  const hasSubtitle = content.subtitle && content.subtitle.replace(/<[^>]*>/g, '').trim().length > 0;

  const animType = style.animationType || 'none';
  const animDuration = style.animationDuration || 0.8;
  const baseDelay = style.animationDelay || 0;
  const animKey = !isStatic ? `${block.id}-${animType}-${animDuration}-${baseDelay}` : 'static';

  const btnAlign = style.align === 'center' ? 'center' : style.align === 'right' ? 'flex-end' : 'flex-start';

  // Submit button — CTA system
  const submitTheme = (content.submitTheme || 'primary') as 'primary' | 'secondary' | 'custom';
  const submitLabel = content.submit || 'Invia messaggio';
  const ctaOverrides = getCTAOverrides(content, style, 'submit', submitTheme);
  const projectSettings = (project?.settings || {}) as any;
  const activeColor = ctaOverrides.bgColor
    || (submitTheme === 'secondary'
      ? (projectSettings.secondaryColor || '#10b981')
      : (projectSettings.primaryColor || '#3b82f6'));
  const themeForStyle: 'primary' | 'secondary' = submitTheme === 'secondary' ? 'secondary' : 'primary';
  const submitBtnStyle = getButtonStyle(project, activeColor, viewport, themeForStyle, isStatic || false, ctaOverrides);
  const submitBtnClass = getButtonClass(project, ctaOverrides.animation);

  const formGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {fields.map((field, i) => renderField(field, i, isStatic))}
    </div>
  );

  const submitBtn = (
    <div style={{ display: 'flex', justifyContent: btnAlign }}>
      <button
        type={isStatic ? 'submit' : 'button'}
        data-w3f-btn={isStatic ? '' : undefined}
        className={submitBtnClass}
        style={{
          // Explicit browser resets first
          appearance: 'none',
          WebkitAppearance: 'none',
          border: 'none',
          outline: 'none',
          // CTA system styles
          ...submitBtnStyle,
          // Final overrides
          cursor: isStatic ? 'pointer' : 'default',
          fontFamily: 'inherit',
        }}
      >
        {submitLabel}
      </button>
    </div>
  );

  return (
    <section
      key={animKey}
      className="w-full relative overflow-hidden"
      style={{
        background: 'var(--block-bg)',
        paddingTop: 'var(--block-pt)',
        paddingBottom: 'var(--block-pb)',
        color: 'var(--block-color)',
        borderRadius: 'var(--block-radius)',
        borderWidth: 'var(--block-border-w)',
        borderColor: 'var(--block-border-c)',
      }}
    >
      {(content.sectionId || block.id) && (
        <span id={content.sectionId || block.id} className="absolute -top-[100px] left-0 w-full h-0 pointer-events-none" />
      )}
      <BlockBackground
        backgroundImage={content.backgroundImage}
        backgroundAlt={content.backgroundAlt}
        style={style}
        project={project}
        isStatic={isStatic}
      />
      <div
        id={block.id}
        className="relative z-10 w-full mx-auto flex flex-col"
        style={{
          paddingLeft: 'var(--block-px)',
          paddingRight: 'var(--block-px)',
          maxWidth: 'var(--block-max-width)',
          alignItems: 'var(--block-items)' as any,
          textAlign: 'var(--block-align)' as any,
          margin: '0 auto',
        }}
      >
        {/* Title */}
        {(hasTitle || onInlineEdit) && (
          <div
            className="w-full"
            style={{ marginBottom: 'calc(var(--block-gap) * 0.4)', '--siti-anim-duration': animDuration + 's', '--siti-anim-delay': baseDelay + 's' } as any}
            data-siti-anim={animType}
          >
            {onInlineEdit ? (
              <InlineEditable
                fieldId="title"
                value={content.title || ''}
                onChange={(v) => onInlineEdit('title', v)}
                className="tracking-tight w-full rt-content"
                style={{ fontSize: 'var(--title-fs)', fontWeight: 'var(--title-fw)' as any, fontStyle: 'var(--title-fs-style)' as any, letterSpacing: 'var(--title-ls)', lineHeight: 'var(--title-lh)', color: 'inherit', textAlign: 'inherit' }}
                placeholder="Titolo..."
              />
            ) : (
              <div
                className="tracking-tight w-full rt-content"
                style={{ fontSize: 'var(--title-fs)', fontWeight: 'var(--title-fw)' as any, fontStyle: 'var(--title-fs-style)' as any, letterSpacing: 'var(--title-ls)', lineHeight: 'var(--title-lh)', color: 'inherit', textAlign: 'inherit' }}
                dangerouslySetInnerHTML={{ __html: formatRichText(content.title || '') }}
              />
            )}
          </div>
        )}

        {/* Subtitle */}
        {(hasSubtitle || onInlineEdit) && (
          <div
            className="w-full"
            style={{ marginBottom: 'var(--block-gap)', '--siti-anim-duration': animDuration + 's', '--siti-anim-delay': (baseDelay + 0.1) + 's' } as any}
            data-siti-anim={animType}
          >
            {onInlineEdit ? (
              <InlineEditable
                fieldId="subtitle"
                value={content.subtitle || ''}
                onChange={(v) => onInlineEdit('subtitle', v)}
                className="w-full rt-content"
                style={{ fontSize: 'var(--subtitle-fs)', color: 'inherit', opacity: 0.7, textAlign: 'inherit' }}
                placeholder="Sottotitolo..."
              />
            ) : (
              <div
                className="w-full rt-content"
                style={{ fontSize: 'var(--subtitle-fs)', color: 'inherit', opacity: 0.7, textAlign: 'inherit' }}
                dangerouslySetInnerHTML={{ __html: formatRichText(content.subtitle || '') }}
              />
            )}
          </div>
        )}

        {/* Form */}
        <div
          className="w-full cf-block"
          data-sidebar-section="fields"
          data-siti-anim={animType}
          data-siti-anim-duration={animDuration}
          data-siti-anim-delay={baseDelay + 0.15}
        >
          <style dangerouslySetInnerHTML={{ __html: CF_STYLE }} />
          {isStatic ? (
            <>
              <form
                data-w3f=""
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}
              >
                {content.accessKey && (
                  <input type="hidden" name="access_key" value={content.accessKey} />
                )}
                <input type="hidden" name="subject" value={content.formSubject || 'Nuovo messaggio dal sito'} />
                <input type="checkbox" name="botcheck" style={{ display: 'none' }} />

                {formGrid}
                {submitBtn}

                {/* Success — form stays visible, fields are reset */}
                <div
                  data-w3f-success=""
                  style={{
                    display: 'none',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'color-mix(in srgb, currentColor 8%, transparent)',
                    border: '1px solid',
                    borderColor: 'color-mix(in srgb, currentColor 15%, transparent)',
                    fontSize: 'var(--cf-label-fs)',
                    fontWeight: 600,
                  }}
                >
                  {content.successMessage || 'Grazie! Ti risponderemo presto.'}
                </div>

                <div
                  data-w3f-error=""
                  style={{
                    display: 'none',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'color-mix(in srgb, red 12%, transparent)',
                    border: '1px solid',
                    borderColor: 'color-mix(in srgb, red 20%, transparent)',
                    fontSize: 'var(--cf-label-fs)',
                  }}
                >
                  {content.errorMessage || "Errore nell'invio. Riprova più tardi."}
                </div>
              </form>
              <script dangerouslySetInnerHTML={{ __html: W3F_SCRIPT }} />
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              {fields.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center', border: '2px dashed', borderColor: 'color-mix(in srgb, currentColor 15%, transparent)', borderRadius: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.3 }}>
                  Nessun campo — aggiungili dalla sidebar
                </div>
              ) : formGrid}
              {submitBtn}
              {!content.accessKey && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'color-mix(in srgb, currentColor 6%, transparent)', fontSize: '12px', opacity: 0.55 }}>
                  ⚠ Inserisci l'Access Key Web3Forms nelle impostazioni per attivare l'invio.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
