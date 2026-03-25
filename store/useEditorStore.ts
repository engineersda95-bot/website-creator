import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Block, Page, Project, ProjectSettings, BlockType } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';
import { TEMPLATES, getBlocksFromTemplate } from '@/lib/templates';
import { BLOCK_DEFINITIONS } from '@/lib/block-definitions';
import { getImageHash, getAssetRelativePath, optimizeImageToWebP } from '@/lib/image-utils';

interface EditorState {
  project: Project | null;
  projectPages: Page[];
  currentPage: Page | null;
  selectedBlockId: string | null;
  user: any | null;
  isLoading: boolean;
  isUploading: boolean;
  isInitialized: boolean;
  hasUnsavedChanges: boolean;
  pageHistories: Record<string, { steps: any[], index: number }>;
  takeSnapshot: () => void;
  copiedBlock: Block | null;
  imageMemoryCache: Record<string, string>;
  
  // Actions
  setUnsavedChanges: (val: boolean) => void;
  setProject: (project: Project) => void;
  listProjectPages: (projectId: string) => Promise<void>;
  loadPage: (projectId: string, slug: string, template?: string) => Promise<void>;
  addPage: (title: string, slug: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  saveCurrentPage: () => Promise<void>;
  updatePageSEO: (seo: { title?: string; description?: string; image?: string }) => Promise<void>;
  updateProjectSettings: (settings: Partial<ProjectSettings> & { name?: string }) => Promise<void>;
  
  // Auth Actions
  initialize: () => Promise<void>;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
  viewport: 'desktop' | 'tablet' | 'mobile';
  setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
  undo: () => void;
  redo: () => void;
  
  // Block Actions
  addBlock: (type: BlockType, atIndex?: number) => void;
  updateBlock: (id: string, content: any, style?: any) => void;
  updateBlockStyle: (id: string, style: any) => void;
  removeBlock: (id: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  selectBlock: (id: string | null) => void;
  duplicateBlock: (id: string) => void;
  copyBlock: (id: string) => void;
  pasteBlock: (atIndex?: number) => void;
  hydrateEditor: (project: Project, pages: Page[], pageId?: string) => void;
  publishProject: () => Promise<{ success: boolean; url?: string; error?: string }>;
  uploadImage: (base64: string, filename?: string) => Promise<string>;
}

const triggerAutoSave = (get: () => EditorState, set?: any) => {
  if (set) {
    set({ hasUnsavedChanges: true });
    get().takeSnapshot();
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  projectPages: [],
  currentPage: null,
  selectedBlockId: null,
  user: null,
  isLoading: false,
  isUploading: false,
  isInitialized: false,
  hasUnsavedChanges: false,
  setUnsavedChanges: (val) => set({ hasUnsavedChanges: val }),
  viewport: 'desktop',
  setViewport: (v) => set({ viewport: v }),
  pageHistories: {},
  copiedBlock: null,
  imageMemoryCache: {},

  takeSnapshot: () => {
    const { currentPage, project, pageHistories } = get();
    if (!currentPage || !project) return;
    
    const pageId = currentPage.id;
    const currentHist = pageHistories[pageId] || { steps: [], index: -1 };
    
    const snapshot = {
      pageId: pageId,
      blocks: JSON.parse(JSON.stringify(currentPage.blocks)),
      settings: JSON.parse(JSON.stringify(project.settings))
    };

    const newSteps = currentHist.steps.slice(0, currentHist.index + 1);
    const last = currentHist.index >= 0 ? newSteps[currentHist.index] : null;
    
    if (last) {
      const sameBlocks = JSON.stringify(last.blocks) === JSON.stringify(snapshot.blocks);
      const sameSettings = JSON.stringify(last.settings) === JSON.stringify(snapshot.settings);
      if (sameBlocks && sameSettings) return;
    }

    newSteps.push(snapshot);
    if (newSteps.length > 50) newSteps.shift();
    
    set({ 
       pageHistories: {
         ...pageHistories,
         [pageId]: { steps: newSteps, index: newSteps.length - 1 }
       }
    });
  },

  setProject: (project: Project) => set({ project }),

  listProjectPages: async (projectId: string) => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Store] listProjectPages error:', error);
      return;
    }

    console.log(`[Store] listProjectPages: Found ${data.length} pages`);
    set({ projectPages: data });
  },

  loadPage: async (projectId: string, slug: string, template?: string) => {
    const { currentPage } = get();
    if (currentPage && currentPage.project_id === projectId) {
      await get().saveCurrentPage();
    }

    set({ isLoading: true });
    
    if (!get().project || get().project?.id !== projectId) {
       const { data: pData } = await supabase.from('projects').select('*').eq('id', projectId).single();
       if (pData) set({ project: pData });
    }

    const { data: pageData, error } = await supabase
      .from('pages')
      .select('*')
      .eq('project_id', projectId)
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Store] loadPage error:', error);
      set({ isLoading: false, hasUnsavedChanges: false });
      return;
    }

    if (pageData) {
      set({ currentPage: pageData, isLoading: false, hasUnsavedChanges: false });
      get().takeSnapshot(); // Snapshot iniziale per la nuova pagina
    } else if (template) {
      const blocks = getBlocksFromTemplate(template as keyof typeof TEMPLATES);
      const newPage = {
        id: uuidv4(),
        project_id: projectId,
        slug,
        title: slug === 'home' ? 'Home' : slug.charAt(0).toUpperCase() + slug.slice(1),
        blocks,
        updated_at: new Date().toISOString()
      };
      set({ currentPage: newPage, isLoading: false, hasUnsavedChanges: false });
      get().takeSnapshot();
      get().saveCurrentPage();
    } else {
      set({ isLoading: false, hasUnsavedChanges: false });
    }
  },

  addPage: async (title, slug) => {
    const { project, projectPages } = get();
    if (!project) return;

    // Cerca un blocco navigation e footer da clonare
    const navBlockToClone = projectPages.flatMap(p => p.blocks).find(b => b.type === 'navigation');
    const footerBlockToClone = projectPages.flatMap(p => p.blocks).find(b => b.type === 'footer');

    const newBlocks = [];
    if (navBlockToClone) newBlocks.push({ ...navBlockToClone, id: uuidv4() });
    if (footerBlockToClone) newBlocks.push({ ...footerBlockToClone, id: uuidv4() });

    const newPage = {
      id: uuidv4(),
      project_id: project.id,
      slug,
      title,
      blocks: newBlocks,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('pages').insert(newPage);
    if (!error) {
      set(state => ({ projectPages: [...state.projectPages, newPage] }));
    }
  },

  deletePage: async (pageId) => {
    const { error } = await supabase.from('pages').delete().eq('id', pageId);
    if (!error) {
      set(state => ({ 
        projectPages: state.projectPages.filter(p => p.id !== pageId),
        currentPage: state.currentPage?.id === pageId ? null : state.currentPage
      }));
    }
  },

  saveCurrentPage: async () => {
    const { currentPage, projectPages, user, hasUnsavedChanges } = get();
    if (!currentPage || !user || !hasUnsavedChanges) return;
    
    const pagesToSave = [{
      id: currentPage.id,
      project_id: currentPage.project_id,
      slug: currentPage.slug,
      title: currentPage.title,
      blocks: currentPage.blocks,
      seo: currentPage.seo,
      updated_at: new Date().toISOString()
    }];

    const navBlock = currentPage.blocks.find(b => b.type === 'navigation');
    const footerBlock = currentPage.blocks.find(b => b.type === 'footer');

    if (navBlock || footerBlock) {
      for (const p of projectPages) {
        if (p.id === currentPage.id) continue;
        let changed = false;
        const newBlocks = p.blocks.map(b => {
           if (b.type === 'navigation' && navBlock) { changed = true; return { ...navBlock, id: b.id }; }
           if (b.type === 'footer' && footerBlock) { changed = true; return { ...footerBlock, id: b.id }; }
           return b;
        });
        if (changed) {
           pagesToSave.push({
             id: p.id,
             project_id: p.project_id,
             slug: p.slug,
             title: p.title,
             blocks: newBlocks,
             seo: p.seo,
             updated_at: new Date().toISOString()
           });
        }
      }
    }

    const { data: savedData, error } = await supabase.from('pages').upsert(pagesToSave).select();
    if (error) {
      console.error('[Store] saveCurrentPage error:', error);
    } else if (savedData) {
      // Sync local state with server-side data (especially updated_at)
      set(state => ({ 
        hasUnsavedChanges: false,
        currentPage: state.currentPage?.id === savedData[0].id ? { ...state.currentPage, ...savedData[0] } : state.currentPage,
        projectPages: state.projectPages.map(p => {
          const saved = savedData.find(s => s.id === p.id);
          return saved ? { ...p, ...saved } : p;
        })
      }));
    }
  },

  updatePageSEO: async (seo) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const updatedPage = { ...currentPage, seo: { ...(currentPage.seo || {}), ...seo } };
    set({ currentPage: updatedPage });
    triggerAutoSave(get, set);
  },

  updateProjectSettings: async (settings) => {
    const { project, user } = get();
    if (!project) return;

    const { name, ...otherSettings } = settings;
    const newSettings = { ...(project.settings || {}), ...otherSettings };
    const updatedProject = { ...project, name: name || project.name, settings: newSettings };
    
    set({ project: updatedProject });

    if (user) {
      supabase.from('projects')
        .update({ name: updatedProject.name, settings: newSettings })
        .eq('id', project.id)
        .then(({ error }) => {
          if (error) console.error('FAILED to save project settings:', error);
        });
    }
    triggerAutoSave(get, set);
  },

  initialize: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Load copied block from localStorage
    const saved = localStorage.getItem('sv_copied_block');
    let copiedBlock = null;
    if (saved) {
      try { copiedBlock = JSON.parse(saved); } catch(e) {}
    }
    
    set({ user, isInitialized: true, copiedBlock });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, project: null, projectPages: [], currentPage: null });
  },

  copyBlock: (id) => {
    const { currentPage } = get();
    if (!currentPage) return;
    const block = currentPage.blocks.find(b => b.id === id);
    if (block) {
      set({ copiedBlock: block });
      localStorage.setItem('sv_copied_block', JSON.stringify(block));
    }
  },

  pasteBlock: (atIndex?: number) => {
    const { currentPage, projectPages, copiedBlock } = get();
    if (!currentPage || !copiedBlock) return;

    const blockToPaste: Block = copiedBlock;

    const newBlock = { ...blockToPaste, id: uuidv4() };
    const newBlocks = [...currentPage.blocks];
    const insertPos = atIndex !== undefined ? atIndex : newBlocks.length;
    newBlocks.splice(insertPos, 0, newBlock);

    const newCurrentPage = { ...currentPage, blocks: newBlocks };
    set({
      currentPage: newCurrentPage,
      projectPages: projectPages.map(p => p.id === currentPage.id ? newCurrentPage : p),
      selectedBlockId: newBlock.id
    });
    triggerAutoSave(get, set);
  },

  addBlock: (type, atIndex) => {
    const { project, currentPage, projectPages } = get();
    if (!project || !currentPage) return;

    // Check if block type is already present (for global blocks like navigation/footer)
    if (type === 'navigation' || type === 'footer') {
       const existingBlock = currentPage.blocks.find(b => b.id !== 'nav-header' && b.id !== 'footer-main' && b.type === type);
       // Se è un blocco globale speciale lo cloniamo
       if (existingBlock) {
          const newBlock = { ...existingBlock, id: uuidv4() };
          const newBlocks = [...currentPage.blocks];
          const insertPos = atIndex !== undefined ? atIndex : newBlocks.length;
          newBlocks.splice(insertPos, 0, newBlock);
          
          const newCurrentPage = { ...currentPage, blocks: newBlocks };
          set({
             currentPage: newCurrentPage,
             projectPages: projectPages.map(p => p.id === currentPage.id ? newCurrentPage : p),
             selectedBlockId: newBlock.id
          });
          triggerAutoSave(get, set);
          return;
       }
    }

    const appearance = project.settings?.appearance || 'light';
    const themeBg = appearance === 'dark' ? (project.settings?.themeColors?.dark?.bg || '#09090b') : (project.settings?.themeColors?.light?.bg || '#ffffff');
    const themeText = appearance === 'dark' ? (project.settings?.themeColors?.dark?.text || '#ffffff') : (project.settings?.themeColors?.light?.text || '#000000');

    // Get centralized defaults
    const definition = BLOCK_DEFINITIONS[type];
    const defaultContent = definition?.defaults?.content ? JSON.parse(JSON.stringify(definition.defaults.content)) : {};
    const defaultStyle = definition?.defaults?.style ? { ...definition.defaults.style } : { padding: 40, align: 'center' };
    const defaultResponsiveStyles = definition?.defaults?.responsiveStyles ? JSON.parse(JSON.stringify(definition.defaults.responsiveStyles)) : {};


    // Localization/Project dynamic defaults
    if (type === 'navigation' || type === 'footer') {
       if (defaultContent.logoText === 'Studio' || defaultContent.logoText === 'SitiVetrina') {
          defaultContent.logoText = project.name || defaultContent.logoText;
       }
       if (type === 'footer') {
          defaultContent.copyright = `© ${new Date().getFullYear()} ${project.name || 'SitiVetrina'}`;
       }
    }

    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: defaultContent,
      style: defaultStyle,
      responsiveStyles: defaultResponsiveStyles || {}
    };


    const newBlocks = [...currentPage.blocks];
    const insertPos = atIndex !== undefined ? atIndex : newBlocks.length;
    newBlocks.splice(insertPos, 0, newBlock);

    const newCurrentPage = { ...currentPage, blocks: newBlocks };

    set({ 
      currentPage: newCurrentPage,
      projectPages: projectPages.map(p => p.id === currentPage.id ? newCurrentPage : p),
      selectedBlockId: newBlock.id
    });
    triggerAutoSave(get, set);
  },

  updateBlock: (id, content, style) => {
    const { currentPage, viewport, projectPages } = get();
    if (!currentPage) return;

    let targetBlock: any = null;

    const blocks = currentPage.blocks.map(b => {
      if (b.id !== id) return b;
      
      const newBlock = { ...b, content: { ...(b.content || {}), ...content } };
      
      if (style) {
        if (viewport === 'desktop') {
          newBlock.style = { ...(b.style || {}), ...style };
        } else {
          newBlock.responsiveStyles = {
            ...(b.responsiveStyles || {}),
            [viewport]: { ...(b.responsiveStyles?.[viewport] || {}), ...style }
          };
        }
      }
      targetBlock = newBlock;
      return newBlock;
    });

    const isGlobal = targetBlock && (targetBlock.type === 'navigation' || targetBlock.type === 'footer');
    let updatedProjectPages = projectPages;

    if (isGlobal || projectPages.find(p => p.id === currentPage.id)) {
      updatedProjectPages = projectPages.map(page => {
        if (page.id === currentPage.id) {
          return { ...currentPage, blocks };
        }
        if (isGlobal) {
          return {
            ...page,
            blocks: page.blocks.map(b => b.type === targetBlock.type ? { ...targetBlock, id: b.id } : b)
          };
        }
        return page;
      });
    }

    set({ 
      currentPage: { ...currentPage, blocks },
      projectPages: updatedProjectPages
    });
    triggerAutoSave(get, set);
  },

  updateBlockStyle: (id, style) => {
    const { currentPage, viewport, projectPages } = get();
    if (!currentPage) return;

    let targetBlock: any = null;

    const blocks = currentPage.blocks.map(b => {
      if (b.id !== id) return b;
      
      let newBlock = { ...b };
      if (viewport === 'desktop') {
        newBlock.style = { ...(b.style || {}), ...style };
      } else {
        newBlock.responsiveStyles = {
          ...b.responsiveStyles,
          [viewport]: { ...(b.responsiveStyles?.[viewport] || {}), ...style }
        };
      }
      targetBlock = newBlock;
      return newBlock;
    });

    const isGlobal = targetBlock && (targetBlock.type === 'navigation' || targetBlock.type === 'footer');
    let updatedProjectPages = projectPages;

    if (isGlobal || projectPages.find(p => p.id === currentPage.id)) {
      updatedProjectPages = projectPages.map(page => {
        if (page.id === currentPage.id) {
          return { ...currentPage, blocks };
        }
        if (isGlobal) {
          return {
            ...page,
            blocks: page.blocks.map(b => b.type === targetBlock.type ? { ...targetBlock, id: b.id } : b)
          };
        }
        return page;
      });
    }

    set({ 
      currentPage: { ...currentPage, blocks },
      projectPages: updatedProjectPages
    });
    triggerAutoSave(get, set);
  },

  removeBlock: (id) => {
    const { currentPage, projectPages } = get();
    if (!currentPage) return;

    const newCurrentPage = { ...currentPage, blocks: currentPage.blocks.filter(b => b.id !== id) };
    set({ 
      currentPage: newCurrentPage,
      projectPages: projectPages.map(p => p.id === currentPage.id ? newCurrentPage : p),
      selectedBlockId: null
    });
    triggerAutoSave(get, set);
  },

  moveBlockUp: (id) => {
    const { currentPage, projectPages } = get();
    if (!currentPage) return;

    const idx = currentPage.blocks.findIndex(b => b.id === id);
    if (idx <= 0) return;

    const blocks = [...currentPage.blocks];
    [blocks[idx-1], blocks[idx]] = [blocks[idx], blocks[idx-1]];
    const newCurrentPage = { ...currentPage, blocks };

    set({ 
      currentPage: newCurrentPage,
      projectPages: projectPages.map(p => p.id === currentPage.id ? newCurrentPage : p) 
    });
    triggerAutoSave(get);
  },

  moveBlockDown: (id) => {
    const { currentPage, projectPages } = get();
    if (!currentPage) return;

    const idx = currentPage.blocks.findIndex(b => b.id === id);
    if (idx === -1 || idx === currentPage.blocks.length - 1) return;

    const blocks = [...currentPage.blocks];
    [blocks[idx+1], blocks[idx]] = [blocks[idx], blocks[idx+1]];
    const newCurrentPage = { ...currentPage, blocks };

    set({ 
      currentPage: newCurrentPage,
      projectPages: projectPages.map(p => p.id === currentPage.id ? newCurrentPage : p) 
    });
    triggerAutoSave(get, set);
  },

  selectBlock: (id) => set({ selectedBlockId: id }),

  duplicateBlock: (id) => {
    const { currentPage, projectPages } = get();
    if (!currentPage) return;

    const block = currentPage.blocks.find(b => b.id === id);
    if (!block) return;

    const newBlock = { 
       ...block, 
       id: uuidv4()
    };

    const index = currentPage.blocks.findIndex(b => b.id === id);
    const newBlocks = [...currentPage.blocks];
    newBlocks.splice(index + 1, 0, newBlock);

    const newCurrentPage = { ...currentPage, blocks: newBlocks };
    
    set({
      currentPage: newCurrentPage,
      projectPages: projectPages.map(p => p.id === currentPage.id ? newCurrentPage : p),
      selectedBlockId: newBlock.id
    });
    triggerAutoSave(get, set);
  },


  hydrateEditor: (project, pages, pageId) => {
    const targetPage = pageId
      ? pages.find(p => p.id === pageId) || pages[0] || null
      : pages.find(p => p.slug === 'home') || pages[0] || null;
    set({ project, projectPages: pages, currentPage: targetPage });
  },

  publishProject: async () => {
    const { project } = get();
    if (!project) return { success: false, error: 'No project selected' };
    
    try {
      const { data, error } = await supabase.functions.invoke('deploy-project', {
        body: { projectId: project.id }
      });
      if (error) throw error;
      return { success: true, url: data.url };
    } catch (e: any) {
      console.error('Publish error:', e);
      return { success: false, error: e.message || 'Unknown error' };
    }
  },

  uploadImage: async (base64: string, filename?: string) => {
    const { project } = get();
    if (!project || !base64) return base64;

    try {
      set({ isUploading: true });
      
      let finalBlob: Blob;
      let finalExtension = 'webp';
      let finalBase64 = base64;

      try {
        // Optimize to WebP with 80% quality
        const optimized = await optimizeImageToWebP(base64, 0.8);
        finalBlob = optimized.blob;
        finalExtension = optimized.extension;
        
        // Convert Blob back to base64 for memory cache
        const reader = new FileReader();
        finalBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(finalBlob);
        });
      } catch (e) {
        console.warn('[Store] Optimization failed, using original image:', e);
        const match = base64.match(/data:image\/([^;]+);base64,/);
        finalExtension = match ? match[1] : 'png';
        const cleanBase64 = base64.split(',')[1] || base64;
        const byteCharacters = atob(cleanBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        finalBlob = new Blob([byteArray], { type: `image/${finalExtension}` });
      }

      const hash = await getImageHash(base64);
      
      // Update filename with .webp if it was optimized
      let cleanFilename = filename 
        ? filename.replace(/[^a-zA-Z0-9.-]/g, '_')
        : `img_${hash}.${finalExtension}`;
      
      // Force change extension only if it was indeed optimized
      if (finalExtension === 'webp' && !cleanFilename.endsWith('.webp')) {
         cleanFilename = cleanFilename.replace(/\.[^/.]+$/, "") + ".webp";
      }
        
      const relativePath = `/assets/${cleanFilename}`;
      const bucketPath = `${project.id}/${cleanFilename}`;

      // 1. Update memory cache for instant preview with optimized version
      set(state => ({
        imageMemoryCache: {
          ...state.imageMemoryCache,
          [relativePath]: finalBase64
        }
      }));

      // 2. Upload to Supabase Storage if not exists
      const { error: uploadError } = await supabase.storage
        .from('project-assets')
        .upload(bucketPath, finalBlob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError && uploadError.message !== 'The resource already exists') {
        throw uploadError;
      }

      set({ isUploading: false });
      return relativePath;
    } catch (err) {
      console.error('[Store] uploadImage error:', err);
      set({ isUploading: false });
      return base64; // Fallback to base64 if upload fails
    }
  },

  undo: () => {
    const { pageHistories, project, projectPages, currentPage } = get();
    if (!currentPage || !project) return;

    const currentHist = pageHistories[currentPage.id];
    if (!currentHist || currentHist.index <= 0) return;

    const targetIdx = currentHist.index - 1;
    const snapshot = currentHist.steps[targetIdx];
    
    const updatedPage = { ...currentPage, blocks: snapshot.blocks };
    const updatedProject = { ...project, settings: snapshot.settings };
    
    set({ 
       currentPage: updatedPage,
       project: updatedProject,
       pageHistories: {
         ...pageHistories,
         [currentPage.id]: { ...currentHist, index: targetIdx }
       },
       projectPages: projectPages.map(p => p.id === updatedPage.id ? updatedPage : p),
       hasUnsavedChanges: true
    });
  },

  redo: () => {
    const { pageHistories, project, projectPages, currentPage } = get();
    if (!currentPage || !project) return;

    const currentHist = pageHistories[currentPage.id];
    if (!currentHist || currentHist.index >= currentHist.steps.length - 1) return;

    const targetIdx = currentHist.index + 1;
    const snapshot = currentHist.steps[targetIdx];
    
    const updatedPage = { ...currentPage, blocks: snapshot.blocks };
    const updatedProject = { ...project, settings: snapshot.settings };
    
    set({ 
       currentPage: updatedPage,
       project: updatedProject,
       pageHistories: {
         ...pageHistories,
         [currentPage.id]: { ...currentHist, index: targetIdx }
       },
       projectPages: projectPages.map(p => p.id === updatedPage.id ? updatedPage : p),
       hasUnsavedChanges: true
    });
  }
}));
