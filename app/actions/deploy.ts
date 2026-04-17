'use server';

import { generateStaticHtml, generateSitemap, generateRobotsTxt } from '@/lib/generate-static';
import { generateBlogListingHtml, generateBlogPostHtml } from '@/lib/generate-blog-static';
import { getProjectDomain } from '@/lib/url-utils';
import { createClient } from '@/lib/supabase/server';
import { getUserLimits } from '@/lib/permissions';
import { Page, PageStub, SiteGlobal, BlogPost } from '@/types/editor';

import crypto from 'crypto';


const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function deployToCloudflare(projectId: string) {
  const supabase = await createClient();

  const { execSync, execFileSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  let tempDir;

  try {

    // 1. Fetch ALL pages for this project from Supabase
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

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

    const limits = await getUserLimits((await supabase.auth.getUser()).data.user!.id);
    if (project.settings?.customDomain && !limits?.can_custom_domain) {
      return { success: false, error: 'Il tuo piano non include il supporto per domini custom' };
    }

    // Rate limiting: max 1 deploy every 30 seconds per project
    if (project.last_published_at) {
      const secondsSinceLastDeploy = (Date.now() - new Date(project.last_published_at).getTime()) / 1000;
      if (secondsSinceLastDeploy < 30) {
        return { success: false, error: `Attendi ${Math.ceil(30 - secondsSinceLastDeploy)} secondi prima di pubblicare di nuovo.` };
      }
    }

    // Fetch site_globals (nav/footer per language) for this project
    const { data: siteGlobals } = await supabase
      .from('site_globals')
      .select('*')
      .eq('project_id', projectId);
    const globals: SiteGlobal[] = siteGlobals || [];

    // Fetch published blog posts (needed for blog-list blocks + blog page generation)
    const { data: blogPostsData } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('project_id', projectId)
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    const blogPosts: BlogPost[] = blogPostsData || [];

    const projectName = project.subdomain;
    if (!/^[a-z0-9-]+$/.test(projectName)) throw new Error('Nome progetto non valido.');
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

    // Helper to collect asset filenames from generated HTML
    const collectAssets = (html: string) => {
      const assetRegex = /\/assets\/([^"\s?]+)/g;
      let match;
      while ((match = assetRegex.exec(html)) !== null) {
        const assetName = match[1];
        if (assetName !== 'styles.css') assetsToDownload.add(assetName);
      }
    };

    // First pass: generate HTML for each page and collect assets
    const defaultLanguage = project.settings?.defaultLanguage || 'it';
    const siteLanguages = project.settings?.languages || [defaultLanguage];
    const isMultilingual = siteLanguages.length > 1;

    // Build lightweight page stubs for hreflang (no blocks payload)
    const pageStubs: PageStub[] = pages.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      language: p.language,
      translations_group_id: p.translations_group_id,
    }));

    // Pre-group blog post siblings by translation_group for efficient hreflang lookup
    const postSiblingMap = new Map<string, BlogPost[]>();
    for (const post of blogPosts) {
      const group = post.translation_group;
      if (group) {
        if (!postSiblingMap.has(group)) postSiblingMap.set(group, []);
        postSiblingMap.get(group)!.push(post);
      }
    }

    for (const page of pages) {
      // Filter blog posts by page language for multilingual sites
      const pageLangForPosts = page.language || defaultLanguage;
      const pageBlogPosts = isMultilingual
        ? blogPosts.filter(p => (p.language || defaultLanguage) === pageLangForPosts)
        : blogPosts;

      // Pass only sibling stubs (same translation group) for hreflang
      const pageLangVal = page.language || defaultLanguage;
      const pageVariants = pageStubs.filter(s =>
        page.translations_group_id
          ? s.translations_group_id === page.translations_group_id
          : (page.slug === 'home' ? s.slug === 'home' : s.slug === page.slug)
      );

      const htmlContent = generateStaticHtml(page as Page, pageVariants, project, globals, pageBlogPosts);
      void pageLangVal; // used above
      collectAssets(htmlContent);

      const pageLang = page.language || defaultLanguage;
      let targetDir = tempDir;

      // Handle subfolder for non-default languages
      if (pageLang !== defaultLanguage) {
        targetDir = path.join(tempDir, pageLang);
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      }

      // The 'blog' slug page goes to /blog/index.html to avoid conflict with /blog/ directory
      if (page.slug === 'blog') {
        const blogPageDir = path.join(targetDir, 'blog');
        if (!fs.existsSync(blogPageDir)) fs.mkdirSync(blogPageDir, { recursive: true });
        fs.writeFileSync(path.join(blogPageDir, 'index.html'), htmlContent);
        console.log(`Generated ${pageLang !== defaultLanguage ? pageLang + '/' : ''}blog/index.html`);
      } else {
        const filename = page.slug === 'home' ? 'index.html' : `${page.slug}.html`;
        fs.writeFileSync(path.join(targetDir, filename), htmlContent);
        console.log(`Generated ${filename} in ${pageLang}`);
      }
    }

    // 3.1. Generate blog pages (listing, individual posts, author pages)
    if (blogPosts.length > 0) {
      const langsToGenerate = isMultilingual ? siteLanguages : [defaultLanguage];

      for (const lang of langsToGenerate) {
        const langPosts = blogPosts.filter(p => (p.language || defaultLanguage) === lang);
        if (langPosts.length === 0 && lang !== defaultLanguage) continue;

        const langSubfolder = lang === defaultLanguage ? '' : lang;
        const langUrlPrefix = langSubfolder ? `/${langSubfolder}` : '';
        const blogDir = langSubfolder
          ? path.join(tempDir, langSubfolder, 'blog')
          : path.join(tempDir, 'blog');
        if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });

        // Blog listing: only generate standalone if no 'blog' page exists for this language
        const hasBlogPageForLang = pages.some((p: any) => p.slug === 'blog' && (p.language || defaultLanguage) === lang);
        if (!hasBlogPageForLang && langPosts.length > 0) {
          const defaultBlogPage = pages.find((p: any) => p.slug === 'blog');
          if (defaultBlogPage) {
            // Clone the default blog page with the target language
            const clonedPage = { ...defaultBlogPage, language: lang } as Page;
            const cloneVariants = pageStubs.filter(s =>
              defaultBlogPage.translations_group_id
                ? s.translations_group_id === defaultBlogPage.translations_group_id
                : s.slug === defaultBlogPage.slug
            );
            const listingHtml = generateStaticHtml(clonedPage, cloneVariants, project, globals, langPosts);
            fs.writeFileSync(path.join(blogDir, 'index.html'), listingHtml);
            collectAssets(listingHtml);
            console.log(`Generated ${langSubfolder ? langSubfolder + '/' : ''}blog/index.html (cloned from default)`);
          } else {
            const listingHtml = generateBlogListingHtml(langPosts, project, langUrlPrefix, globals);
            fs.writeFileSync(path.join(blogDir, 'index.html'), listingHtml);
            collectAssets(listingHtml);
            console.log(`Generated ${langSubfolder ? langSubfolder + '/' : ''}blog/index.html (standalone)`);
          }
        }

        // Individual post pages
        for (const post of langPosts) {
          const siblings = post.translation_group
            ? (postSiblingMap.get(post.translation_group) || [post])
            : [post];
          const postHtml = generateBlogPostHtml(post, project, langUrlPrefix, siblings, globals);
          fs.writeFileSync(path.join(blogDir, `${post.slug}.html`), postHtml);
          collectAssets(postHtml);
          console.log(`Generated ${langSubfolder ? langSubfolder + '/' : ''}blog/${post.slug}.html`);
        }

      }
    }

    // 3.2. Generate Sitemap, Robots.txt, _headers & _redirects
    const sitemapContent = generateSitemap(pageStubs, project, blogPosts);
    const robotsContent = generateRobotsTxt(project, pages as any as Page[]);
    const headersContent = `
/sitemap.xml
  Content-Type: application/xml
/robots.txt
  Content-Type: text/plain
`.trim();

    // For multilingual sites, redirect /{defaultLang}/* → /* so the default language
    // subfolder doesn't serve broken pages (the default lang lives at root).
    const redirectsContent = isMultilingual
      ? [
          `/${defaultLanguage} / 301`,
          `/${defaultLanguage}/* /:splat 301`,
        ].join('\n')
      : '';

    fs.writeFileSync(path.join(tempDir, 'sitemap.xml'), sitemapContent);
    fs.writeFileSync(path.join(tempDir, 'robots.txt'), robotsContent);
    fs.writeFileSync(path.join(tempDir, '_headers'), headersContent);
    if (redirectsContent) fs.writeFileSync(path.join(tempDir, '_redirects'), redirectsContent);
    console.log('Generated sitemap.xml, robots.txt and _headers');

    // Second pass: download unique assets from Supabase Storage
    console.log(`Downloading ${assetsToDownload.size} unique assets from Supabase...`);
    await Promise.all(Array.from(assetsToDownload).map(async (assetFilename) => {
      const bucketPath = `${project.user_id}/${projectId}/${assetFilename}`;
      const localPath = path.join(assetsDir, assetFilename);
      try {
        const { data, error: downloadError } = await supabase.storage
          .from('project-assets')
          .download(bucketPath);
        if (downloadError) {
          console.warn(`Could not download asset ${bucketPath}:`, downloadError.message);
          return;
        }
        const buffer = Buffer.from(await data.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
      } catch (e: any) {
        console.error(`Failed to download ${assetFilename}:`, e.message);
      }
    }));

    // 3.2. Generate static Tailwind CSS
    console.log('Generating production Tailwind CSS via standalone binary...');
    
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
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
      const inputCssContent = `@import "tailwindcss";\n@source "${tempDir.replace(/\\/g, '/')}/**/*.html";`;

      if (isProduction) {
        // PRODUCTION (Vercel/Serverless): Use standalone binary to bypass node_modules resolution issues
        const binaryPath = '/tmp/tailwindcss-v4-binary';
        if (!fs.existsSync(binaryPath)) {
          console.log('Downloading Tailwind v4 standalone binary...');
          const res = await fetch('https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64');
          if (!res.ok) throw new Error('Could not download Tailwind binary');
          const buffer = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(binaryPath, buffer);
          fs.chmodSync(binaryPath, '755');
        }

        execSync(`${binaryPath} -m -o "${path.join(assetsDir, 'styles.css')}"`, { 
          input: inputCssContent,
          env: commonEnv,
          encoding: 'utf-8' 
        });
      } else {
        // LOCALHOST: Use npx (already installed) and a temporary file in root for perfect resolution
        const localInputPath = path.join(process.cwd(), `tailwind-input-${projectId}.css`);
        fs.writeFileSync(localInputPath, inputCssContent);
        try {
          execSync(`npx --yes @tailwindcss/cli -m -i "${localInputPath}" -o "${path.join(assetsDir, 'styles.css')}"`, {
            env: commonEnv,
            encoding: 'utf-8'
          });
        } finally {
          if (fs.existsSync(localInputPath)) fs.unlinkSync(localInputPath);
        }
      }
      console.log('Tailwind CSS generated successfully');
    } catch (e: any) {
      console.warn('Tailwind CSS generation failed:', e.message);
      fs.writeFileSync(path.join(assetsDir, 'styles.css'), '/* Tailwind generation failed */');
    }

    // --- PERFORMANCE OPTIMIZATION: LOCAL FONT HOSTING ---
    // Specifically downloads Google Fonts and serves them locally for speed and GDPR.
    const fontName = project.settings?.fontFamily || 'Outfit';
    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
    const fontsSubDir = path.join(assetsDir, 'fonts');
    let localFontStyleTag = '';

    try {
      console.log(`Downloading local fonts for ${fontName}...`);
      if (!fs.existsSync(fontsSubDir)) fs.mkdirSync(fontsSubDir, { recursive: true });

      const cssRes = await fetch(googleFontUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      
      if (cssRes.ok) {
        let fontCss = await cssRes.text();
        const fontUrlMatches = [...fontCss.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/.*?)\)/g)];
        
        for (const [fullMatch, remoteUrl] of fontUrlMatches) {
          const fontFilename = path.basename(new URL(remoteUrl).pathname);
          const fontLocalPath = path.join(fontsSubDir, fontFilename);
          if (!fs.existsSync(fontLocalPath)) {
            const fontRes = await fetch(remoteUrl);
            if (fontRes.ok) fs.writeFileSync(fontLocalPath, Buffer.from(await fontRes.arrayBuffer()));
          }
          fontCss = fontCss.replace(remoteUrl, `/assets/fonts/${fontFilename}`);
        }
        localFontStyleTag = `<style>\n${fontCss}\n</style>`;
      }

      // Safe Post-processing: Replace ONLY the Google Font link
      if (localFontStyleTag) {
        const googleFontLinkRegex = /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]+" rel="stylesheet">/gi;
        const processDir = (dir: string) => {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
              if (file !== 'assets') processDir(fullPath);
            } else if (file.endsWith('.html')) {
              let html = fs.readFileSync(fullPath, 'utf8');
              if (googleFontLinkRegex.test(html)) {
                fs.writeFileSync(fullPath, html.replace(googleFontLinkRegex, `\n${localFontStyleTag}\n`));
              }
            }
          }
        };
        processDir(tempDir);
        console.log('Local fonts localized successfully.');
      }
    } catch (err: any) {
      console.warn('Local font hosting failed, falling back to Google CDN:', err.message);
    }
    // ----------------------------------------------------

    const wranglerArgs = ['--yes', 'wrangler@3', 'pages', 'deploy', tempDir, `--project-name=${projectName}`, '--branch=main'];
    const wranglerEnv = {
      ...commonEnv,
      WRANGLER_SEND_METRICS: 'false',
      WRANGLER_SEND_TELEMETRY: 'false',
      WRANGLER_LOG_PATH: '/tmp/wrangler-deploy.log',
    };
    const isWindows = process.platform === 'win32';
    const output = isWindows
      ? execSync(`npx ${wranglerArgs.join(' ')}`, { cwd: '/tmp', env: wranglerEnv, encoding: 'utf-8' })
      : execFileSync('npx', wranglerArgs, { cwd: '/tmp', env: wranglerEnv, encoding: 'utf-8' });
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
