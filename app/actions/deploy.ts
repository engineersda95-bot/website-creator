'use server';

import { generateStaticHtml } from '@/lib/generate-static';
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
      .single();

    if (projectError || !project) throw new Error('Could not find project to deploy');

    const projectName = project.subdomain;

    // 2. Ensure project exists on Cloudflare
    try {
      await ensureCloudflareProject(projectName);
    } catch (e) {
      console.warn('Could not ensure project existence:', e);
      // Continue anyway, wrangler might handle it
    }

    // 3. Deployment via Wrangler CLI
    console.log(`Deploying ${pages.length} pages for project: ${projectName} via Wrangler...`);
    
    tempDir = path.join(os.tmpdir(), `siti-vetrina-deploy-${Date.now()}`);
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    // 3. Generate HTML for each page
    const assetsDir = path.join(tempDir, 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    const imageMap = new Map<string, string>(); // base64 -> filename

    for (const page of pages) {
      let htmlContent = generateStaticHtml(page as Page, pages as any as Page[], project);

      // Extract base64 images
      const base64Regex = /data:image\/([^;]+);base64,([^"]+)/g;
      let match;
      while ((match = base64Regex.exec(htmlContent)) !== null) {
        const fullMatch = match[0];
        const extension = match[1];
        const base64Data = match[2];

        if (!imageMap.has(fullMatch)) {
          const hash = crypto.createHash('md5').update(base64Data).digest('hex');
          const filename = `img_${hash}.${extension}`;
          const filePath = path.join(assetsDir, filename);
          
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
          }
          imageMap.set(fullMatch, `/assets/${filename}`);
        }
      }

      // Replace all occurrences
      for (const [base64, url] of imageMap.entries()) {
        htmlContent = htmlContent.split(base64).join(url);
      }

      const filename = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
      fs.writeFileSync(path.join(tempDir, filename), htmlContent);
      console.log(`Generated ${filename}`);
    }

    const command = `npx --yes wrangler@3 pages deploy "${tempDir}" --project-name="${projectName}" --branch="main"`;
    
    const env = { 
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

    const output = execSync(command, { env, encoding: 'utf-8' });
    console.log('Wrangler Output:', output);

    const urlMatch = output.match(/https?:\/\/[^\s]+\.pages\.dev/);
    const finalUrl = urlMatch ? urlMatch[0] : `https://${projectName}.pages.dev`;

    // 4. Cleanup old history silently
    cleanupOldDeployments(projectName).catch(e => console.error('Cleanup failed:', e));

    return { success: true, url: finalUrl };
  } catch (err: any) {
    const errorMsg = err.stdout?.toString() || err.stderr?.toString() || err.message;
    console.error('Deployment failed:', errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    if (tempDir && fs.existsSync(tempDir)) {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }
  }
}

async function ensureCloudflareProject(name: string) {
  const res = await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects/${name}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` }
  });

  if (res.status === 404) {
    await fetch(`${CLOUDFLARE_API_BASE}/accounts/${ACCOUNT_ID}/pages/projects`, {
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
