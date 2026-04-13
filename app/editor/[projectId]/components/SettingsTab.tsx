'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Save, Check } from 'lucide-react';
import { SeoSection } from '@/components/blocks/sidebar/settings/SeoSection';
import { LanguageSection } from '@/components/blocks/sidebar/settings/LanguageSection';
import { AdvancedSection } from '@/components/blocks/sidebar/settings/AdvancedSection';
import { DomainSection } from '@/components/blocks/sidebar/settings/DomainSection';
import type { Project } from '@/types/editor';
import type { UserLimits } from '@/lib/permissions';

interface SettingsTabProps {
  project: Project;
  hasUnsavedChanges: boolean;
  isUploading: boolean;
  uploadImage: (base64: string) => Promise<string>;
  updateProjectSettings: (updates: Record<string, any>) => void;
  saveProject: () => void;
  userLimits: UserLimits | null;
}

export function SettingsTab({
  project,
  hasUnsavedChanges,
  isUploading,
  uploadImage,
  updateProjectSettings,
  saveProject,
  userLimits,
}: SettingsTabProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Sticky save bar */}
      <div className="sticky top-14 z-10 -mx-6 px-6 py-3 bg-zinc-50/90 backdrop-blur-sm border-b border-zinc-200 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-bold text-zinc-900">Impostazioni Progetto</p>
          <p className="text-[11px] text-zinc-400">SEO, lingue e opzioni avanzate</p>
        </div>
        <button
          onClick={saveProject}
          disabled={!hasUnsavedChanges}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-xl transition-all text-sm font-bold shadow-sm",
            hasUnsavedChanges
              ? "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95"
              : "bg-zinc-100 text-zinc-400 cursor-default"
          )}
        >
          {hasUnsavedChanges ? <Save size={15} /> : <Check size={15} />}
          {hasUnsavedChanges ? 'Salva' : 'Salvato'}
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm space-y-8">
        <SeoSection
          project={project}
          updateProjectSettings={updateProjectSettings}
          isUploading={isUploading}
          uploadImage={uploadImage}
        />

        <div className="pt-8 border-t border-zinc-100">
          <LanguageSection
            project={project}
            updateProjectSettings={updateProjectSettings}
            canMultilang={userLimits?.can_multilang ?? false}
          />
        </div>

        <div className="pt-8 border-t border-zinc-100">
          <AdvancedSection
            project={project}
            updateProjectSettings={updateProjectSettings}
            canCustomScripts={userLimits?.can_custom_scripts ?? false}
          />
        </div>

        <div className="pt-8 border-t border-zinc-100">
          <DomainSection
            project={project}
            updateProjectSettings={updateProjectSettings}
            canCustomDomain={userLimits?.can_custom_domain ?? false}
          />
        </div>
      </div>
    </div>
  );
}
