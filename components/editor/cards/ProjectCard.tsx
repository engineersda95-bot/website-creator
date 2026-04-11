"use client";

import { LANGUAGES } from "@/lib/editor-constants";
import { getProjectDomain } from "@/lib/url-utils";
import { cn } from "@/lib/utils";
import { Clock, Globe, Loader2, Settings as SettingsIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { LanguageBadge } from "@/components/shared/LanguageBadge";

interface ProjectCardProps {
  project: any;
  formatDate: (d: string) => string;
  onDelete: (id: string, name: string) => Promise<void>;
  isDeleting?: boolean;
}

export function ProjectCard({
  project,
  formatDate,
  onDelete,
  isDeleting,
}: ProjectCardProps) {
  const projectLangs = project.settings?.languages || [project.settings?.defaultLanguage || "it"];
  const liveUrl = project.live_url ? getProjectDomain(project) : "";

  return (
    <div className={cn(
      "group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all",
      isDeleting && "opacity-50 pointer-events-none"
    )}>
      <Link href={`/editor/${project.id}`} className="block">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                project.live_url ? "bg-emerald-500" : "bg-zinc-300",
              )}
            />
          </div>
          <p className="text-xs text-zinc-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Globe size={11} />
              {project.subdomain}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatDate(project.created_at)}
            </span>
          </p>
        </div>
      </Link>
      <div className="px-4 py-2.5 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {projectLangs.map((lang: string) => (
            <LanguageBadge key={lang} languageCode={lang} showCode={true} />
          ))}
        </div>
        <button
          onClick={() => onDelete(project.id, project.name)}
          disabled={isDeleting}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isDeleting
              ? "text-red-400 bg-red-50 opacity-100"
              : "text-zinc-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100"
          )}
          title="Elimina sito"
        >
          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}
