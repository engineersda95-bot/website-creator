import { Project } from '@/types/editor';

/**
 * Returns the base domain for the project.
 * Priority: 
 * 1. project.live_url (if not empty)
 * 2. project.subdomain + '.pages.dev' (default provider suffix)
 */
export function getProjectDomain(project?: Project | null): string {
  if (project?.live_url) {
    return project.live_url.replace(/\/$/, ''); // Remove trailing slash
  }
  
  if (project?.subdomain) {
    const sub = project.subdomain;
    // ensure it's a full URL
    const fullDomain = sub.includes('.') ? sub : `${sub}.pages.dev`;
    return `https://${fullDomain}`;
  }
  
  return '';
}

/**
 * Ensures a slug or relative path is prepended with the project's base domain
 */
export function getAbsoluteUrl(path: string, project?: Project | null): string {
  const domain = getProjectDomain(project);
  if (!domain) return path;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${domain}${cleanPath}`;
}
