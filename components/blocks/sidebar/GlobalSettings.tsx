"use client";

import { useEditorStore } from "@/store/useEditorStore";
import { ProjectSettings } from "@/types/editor";
import {
  Globe,
  Languages,
  MousePointer,
  Palette,
  Search,
  Smartphone,
  Store,
  Type,
} from "lucide-react";
import React from "react";
import {
  UnifiedSection as Section,
  useUnifiedSections,
} from "./SharedSidebarComponents";

// Modular Sections
import { t } from "@/lib/i18n";
import { ButtonDesignSection } from "./settings/ButtonDesignSection";
import { BusinessSeoSection, FaviconSection, SeoSection } from "./settings/SeoSection";
import { ThemeSection } from "./settings/ThemeSection";
import { TypographySection } from "./settings/TypographySection";

interface GlobalSettingsProps {
  project: any;
  updateProjectSettings: (settings: Partial<ProjectSettings>) => void;
  viewport: string;
  variant?: "sidebar" | "page";
}

export const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  project,
  updateProjectSettings,
  viewport,
  variant = "sidebar",
}) => {
  const { isUploading, uploadImage } = useEditorStore();
  const { openSection, toggleSection } = useUnifiedSections();
  const isPage = variant === "page";
  const lang = project?.settings?.defaultLanguage || "it";

  // For 'page' variant (dashboard), render flat without accordion
  if (isPage) {
    return (
      <div className="w-full space-y-8 py-2">
        <TypographySection
          project={project}
          updateProjectSettings={updateProjectSettings}
        />
        <ThemeSection
          project={project}
          updateProjectSettings={updateProjectSettings}
        />
        <ButtonDesignSection
          project={project}
          updateProjectSettings={updateProjectSettings}
          viewport={viewport}
        />
        <SeoSection
          project={project}
          updateProjectSettings={updateProjectSettings}
          isUploading={isUploading}
          uploadImage={uploadImage}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-white overflow-hidden relative h-full shadow-2xl">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
        <h2 className="text-[13px] font-bold text-zinc-900">
          {t("global_design", lang)}
        </h2>
        {viewport !== "desktop" && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Smartphone size={9} />
            {viewport}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Section
          icon={Type}
          label="Tipografia"
          id="typography"
          isOpen={openSection === "typography"}
          onToggle={toggleSection}
        >
          <div className="[&>section]:pt-0 [&>section]:border-t-0 [&>section>div:first-child]:hidden">
            <TypographySection
              project={project}
              updateProjectSettings={updateProjectSettings}
            />
          </div>
        </Section>

        <Section
          icon={Palette}
          label="Tema & Colori"
          id="theme"
          isOpen={openSection === "theme"}
          onToggle={toggleSection}
        >
          <div className="[&>section]:pt-0 [&>section]:border-t-0 [&>section>div:first-child]:hidden">
            <ThemeSection
              project={project}
              updateProjectSettings={updateProjectSettings}
            />
          </div>
        </Section>

        <Section
          icon={MousePointer}
          label="Stile Pulsanti"
          id="buttons"
          isOpen={openSection === "buttons"}
          onToggle={toggleSection}
        >
          <div className="[&>section]:pt-0 [&>section]:border-t-0 [&>section>div:first-child]:hidden">
            <ButtonDesignSection
              project={project}
              updateProjectSettings={updateProjectSettings}
              viewport={viewport}
            />
          </div>
        </Section>

        <Section
          icon={Globe}
          label="Favicon"
          id="favicon"
          isOpen={openSection === "favicon"}
          onToggle={toggleSection}
        >
          <div className="[&>section]:pt-0 [&>section]:border-t-0 [&>section>div:first-child]:hidden">
            <FaviconSection
              project={project}
              updateProjectSettings={updateProjectSettings}
              isUploading={isUploading}
              uploadImage={uploadImage}
            />
          </div>
        </Section>

        <Section
          icon={Search}
          label="Dati Attività e SEO"
          id="seo"
          isOpen={openSection === "seo"}
          onToggle={toggleSection}
        >
          <div className="[&>section]:pt-0 [&>section]:border-t-0 [&>section>div:first-child]:hidden">
            <BusinessSeoSection
              project={project}
              updateProjectSettings={updateProjectSettings}
              isUploading={isUploading}
              uploadImage={uploadImage}
            />
          </div>
        </Section>
      </div>
    </div>
  );
};

