'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Clock, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: any;
  formatDate: (d: string) => string;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => Promise<void>;
}

export function ProjectCard({ project, formatDate, onEdit, onDelete }: ProjectCardProps) {
  return (
    <div
      className="group relative bg-white border border-zinc-200 rounded-xl overflow-hidden hover:shadow-md hover:border-zinc-300 transition-all"
    >
      <Link href={`/editor/${project.id}`} className="block">
        <div className="h-32 bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
          <Globe size={28} className="text-zinc-200" />
        </div>
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <div className={cn(
              "w-2 h-2 rounded-full",
              project.live_url ? "bg-emerald-500" : "bg-zinc-300"
            )} />
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
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(project.id)}
            className="p-1.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
            title="Impostazioni attività"
          >
            <SettingsIcon size={14} />
          </button>
        </div>
        <button
          onClick={() => onDelete(project.id, project.name)}
          className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="Elimina sito"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
