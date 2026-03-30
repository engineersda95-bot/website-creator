'use server';

import { generateStaticHtml, generateSitemap, generateRobotsTxt } from '@/lib/generate-static';
import { getProjectDomain } from '@/lib/url-utils';
import { UserMenu } from '@/components/auth/UserMenu';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { Page } from '@/types/editor';
import crypto from 'crypto';


const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function deployToCloudflare(projectId: string) {
  const supabase = await createClient();

  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  let tempDir;

  try {

    // 1. Fetch ALL pages for this project from Supabase
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId);

    if (pagesError || !pages || pages.length === 0) {
      throw new Error('Could not find any pages for this project');
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (projectError || !project) throw new Error('Could not find project to deploy or unauthorized access');

    const projectName = project.subdomain;
    const isFirstPublish = !project.live_url;

    // 2. Ensure project exists on Cloudflare and get the actual subdomain
    try {
      const cfProject = await ensureCloudflareProject(projectName);
      if (cfProject && cfProject.subdomain && isFirstPublish) {
        // Use getProjectDomain logic to predict/set the URL
        project.live_url = getProjectDomain({ ...project, subdomain: cfProject.subdomain } as any);
      }
    } catch (e) {
      console.warn('Could not ensure project existence:', e);
    }

    // 3. Deployment via Wrangler CLI
    console.log(`Deploying ${pages.length} pages for project: ${projectName} via Wrangler...`);

    tempDir = path.join(os.tmpdir(), `siti-vetrina-deploy-${Date.now()}`);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // 3. Generate HTML for each page and collect assets
    const assetsDir = path.join(tempDir, 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    const assetsToDownload = new Set<string>(); // set of filenames (img_hash.ext)

    // First pass: generate HTML and find all relative asset paths
    const defaultLanguage = project.settings?.defaultLanguage || 'it';

    for (const page of pages) {
      const htmlContent = generateStaticHtml(page as Page, pages as any as Page[], project);

      // Find all /assets/... strings in the HTML (captures the filename)
      const assetRegex = /\/assets\/([^"\s?]+)/g;
      let match;
      while ((match = assetRegex.exec(htmlContent)) !== null) {
        const assetName = match[1];
        if (assetName !== 'styles.css') {
          assetsToDownload.add(assetName);
        }
      }

      const pageLang = page.language || defaultLanguage;
      let targetDir = tempDir;

      // Handle subfolder for non-default languages
      if (pageLang !== defaultLanguage) {
        targetDir = path.join(tempDir, pageLang);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      }

      const filename = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
      fs.writeFileSync(path.join(targetDir, filename), htmlContent);
      console.log(`Generated ${filename} in ${pageLang}`);
    }

    // 3.1. Generate Sitemap, Robots.txt & _headers (for Cloudflare mime types)
    const sitemapContent = generateSitemap(pages as any as Page[], project);
    const robotsContent = generateRobotsTxt(project, pages as any as Page[]);
    const headersContent = `
/sitemap.xml
  Content-Type: application/xml
/robots.txt
  Content-Type: text/plain
`.trim();

    fs.writeFileSync(path.join(tempDir, 'sitemap.xml'), sitemapContent);
    fs.writeFileSync(path.join(tempDir, 'robots.txt'), robotsContent);
    fs.writeFileSync(path.join(tempDir, '_headers'), headersContent);
    console.log('Generated sitemap.xml, robots.txt and _headers');

    // Second pass: download unique assets from Supabase Storage
    console.log(`Downloading ${assetsToDownload.size} unique assets from Supabase...`);
    for (const assetFilename of assetsToDownload) {
      const bucketPath = `${projectId}/${assetFilename}`;
      const localPath = path.join(assetsDir, assetFilename);

      try {
        const { data, error: downloadError } = await supabase.storage
          .from('project-assets')
          .download(bucketPath);

        if (downloadError) {
          console.warn(`Could not download asset ${bucketPath}:`, downloadError.message);
          continue;
        }

        const buffer = Buffer.from(await data.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
      } catch (e: any) {
        console.error(`Failed to download ${assetFilename}:`, e.message);
      }
    }

    // 3.2. Generate static Tailwind CSS
    console.log('Generating production Tailwind CSS...');
    // We create the input file in the temporary directory to avoid read-only filesystem issues
    // Construct the tailwind package path based on process.cwd() to avoid require.resolve issues in bundled environments
    const tailwindPkgPath = path.join(process.cwd(), 'node_modules', 'tailwindcss').replace(/\\/g, '/');
    const rootInputCssPath = path.join(tempDir, `tailwind-input-${projectId}.css`);
    const inputCssContent = `@import "${tailwindPkgPath}/index.css";\n@source "${tempDir.replace(/\\/g, '/')}/**/*.html";`;
    fs.writeFileSync(rootInputCssPath, inputCssContent);
    
    const commonEnv = {
      ...process.env,
      HOME: '/tmp',
      npm_config_cache: '/tmp/.npm',
      WRANGLER_HOME: '/tmp',
      WRANGLER_CACHE_PATH: '/tmp/wrangler-cache',
      XDG_CONFIG_HOME: '/tmp/.config',
      XDG_CACHE_HOME: '/tmp/.cache',
      CLOUDFLARE_API_TOKEN: API_TOKEN,
      CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID,
      WRANGLER_SKIP_UPDATE_CHECK: '1'
    };

    try {
      // Run from project root so it can resolve 'tailwindcss' package
      execSync(`npx --yes @tailwindcss/cli -i "${rootInputCssPath}" -o "${path.join(assetsDir, 'styles.css')}"`, { 
        env: commonEnv,
        encoding: 'utf-8' 
      });
      console.log('Tailwind CSS generated successfully');
    } catch (e: any) {
      console.warn('Tailwind CSS generation failed:', e.message);
      fs.writeFileSync(path.join(assetsDir, 'styles.css'), '/* Tailwind generation failed */');
    } finally {
      // Cleanup the temporary root file
      if (fs.existsSync(rootInputCssPath)) fs.unlinkSync(rootInputCssPath);
    }

    const command = `npx --yes wrangler@3 pages deploy "${tempDir}" --project-name="${projectName}" --branch="main"`;

    const output = execSync(command, {
      cwd: '/tmp', // Executing from /tmp allows wrangler to ignore the read-only /var/task folder
      env: {
        ...commonEnv,
        WRANGLER_SEND_METRICS: 'false',
        WRANGLER_SEND_TELEMETRY: 'false',
        WRANGLER_LOG_PATH: '/tmp/wrangler-deploy.log',
      },
      encoding: 'utf-8'
    });
    console.log('Wrangler Output:', output);

    const urlMatch = output.match(/https?:\/\/[^\s]+\.[^\s]+/);
    let finalUrl = urlMatch ? urlMatch[0] : getProjectDomain(project as any);

    // Strip the deployment-specific hash if present (e.g., https://hash.project.pages.dev -> https://project.pages.dev)
    const urlParts = finalUrl.replace('https://', '').split('.');
    if (urlParts.length > 3) {
      // It has a deployment hash, remove first part
      finalUrl = `https://${urlParts.slice(1).join('.')}`;
    }

    // 4. Update project in Supabase
    const updateData: any = {
      last_published_at: new Date().toISOString()
    };

    if (isFirstPublish) {
      updateData.live_url = finalUrl;
    }

    const { error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId);

    if (updateError) {
      console.warn('Could not update project with deployment info:', updateError.message);
    }

    // 5. Custom Domain support (Sync always to handle removals too)
    try {
      await syncCustomDomains(projectName, project.settings?.customDomain);
    } catch (e) {
      console.warn('Could not sync custom domain to Cloudflare:', e);
    }

    // 6. Cleanup old history silently
    cleanupOldDeployments(projectName).catch(e => console.error('Cleanup failed:', e));

    return { success: true, url: finalUrl };
  } catch (err: any) {
    const errorMsg = err.stdout?.toString() || err.stderr?.toString() || err.message;
    console.error('Deployment failed:', errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch { }
    }
  }
}

async function ensureCloudflareProject(name: string) {
  const res = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${name}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` }
  });

  if (res.status === 404) {
    const createRes = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        production_branch: 'main'
      })
    });
    if (createRes.ok) {
      const { result } = await createRes.json();
      return result;
    }
  } else if (res.ok) {
    const { result } = await res.json();
    return result;
  }
  return null;
}
async function syncCustomDomains(projectName: string, currentDomain?: string) {
  try {
    // 1. Get existing domains
    const res = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/domains`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });

    if (!res.ok) return;
    const { result } = await res.json();
    const existingDomains = (result || []).map((d: any) => d.name);

    // 2. Determine what should be there
    const desiredDomains = currentDomain ? [currentDomain, `www.${currentDomain}`] : [];

    // 3. Add missing ones
    for (const d of desiredDomains) {
      if (!existingDomains.includes(d)) {
        await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/domains`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: d })
        });
      }
    }

    // 4. Remove extra ones (those not in desiredDomains and actually custom)
    // Pages projects always have their .pages.dev domain which isn't in this listUsually
    for (const d of existingDomains) {
      if (!desiredDomains.includes(d)) {
        await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/domains/${d}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${API_TOKEN}` }
        });
      }
    }
  } catch (err) {
    console.error('[syncCustomDomains] Proxy error:', err);
  }
}

async function cleanupOldDeployments(projectName: string) {
  try {
    const res = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/deployments`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` }
    });

    if (!res.ok) return;

    const { result } = await res.json();
    if (!result || result.length <= 5) return;

    // Keep the first 5 (most recent) deployments
    const toDelete = result.slice(5);

    console.log(`Cleaning up ${toDelete.length} old deployments for ${projectName}...`);

    for (const deploy of toDelete) {
      await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${projectName}/deployments/${deploy.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${API_TOKEN}` }
      });
    }
  } catch (err) {
    console.warn('Cleanup error:', err);
  }
}
