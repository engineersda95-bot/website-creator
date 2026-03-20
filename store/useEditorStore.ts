import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Block, Page, Project, ProjectSettings, BlockType } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';
import { TEMPLATES, getBlocksFromTemplate } from '@/lib/templates';

interface EditorState {
  project: Project | null;
  projectPages: Page[];
  currentPage: Page | null;
  selectedBlockId: string | null;
  user: any | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Actions
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
  addBlock: (type: BlockType) => void;
  updateBlock: (id: string, content: any, style?: any) => void;
  updateBlockStyle: (id: string, style: any) => void;
  removeBlock: (id: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  selectBlock: (id: string | null) => void;
  syncGuestData: () => Promise<void>;
  hydrateEditor: (project: Project, pages: Page[]) => void;
}

const triggerAutoSave = (get: () => EditorState) => {
  const { user, currentPage, project } = get();
  if (user) {
    const timer = (window as any)._saveTimer;
    if (timer) clearTimeout(timer);
    (window as any)._saveTimer = setTimeout(() => get().saveCurrentPage(), 1000);
  } else if (currentPage) {
    const guestData = localStorage.getItem('sv_guest_data');
    let existing = { pages: [], settings: project?.settings };
    try {
      if (guestData) existing = JSON.parse(guestData);
    } catch (e) { console.error('Error parsing guest data', e); }
    
    const pages = existing.pages.map((p: any) => p.id === currentPage.id ? currentPage : p);
    if (!pages.find((p: any) => p.id === currentPage.id)) pages.push(currentPage);
    localStorage.setItem('sv_guest_data', JSON.stringify({ pages, settings: project?.settings }));
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  project: null,
  projectPages: [],
  currentPage: null,
  selectedBlockId: null,
  user: null,
  isLoading: false,
  isInitialized: false,
  viewport: 'desktop',
  setViewport: (v) => set({ viewport: v }),
  undo: () => {
    // TODO: Implement undo functionality
    console.log('Undo not yet implemented');
  },
  redo: () => {
    // TODO: Implement redo functionality
    console.log('Redo not yet implemented');
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
      set({ isLoading: false });
      return;
    }

    if (pageData) {
      set({ currentPage: pageData, isLoading: false });
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
      set({ currentPage: newPage, isLoading: false });
      get().saveCurrentPage();
    } else {
      set({ isLoading: false });
    }
  },

  addPage: async (title, slug) => {
    const { project } = get();
    if (!project) return;

    const newPage = {
      id: uuidv4(),
      project_id: project.id,
      slug,
      title,
      blocks: [],
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
    const { currentPage, user } = get();
    if (!currentPage || !user) return;

    const { error } = await supabase
      .from('pages')
      .upsert({
        id: currentPage.id,
        project_id: currentPage.project_id,
        slug: currentPage.slug,
        title: currentPage.title,
        blocks: currentPage.blocks,
        seo: currentPage.seo,
        updated_at: new Date().toISOString()
      });

    if (error) console.error('[Store] saveCurrentPage error:', error);
  },

  updatePageSEO: async (seo) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const updatedPage = { ...currentPage, seo: { ...(currentPage.seo || {}), ...seo } };
    set({ currentPage: updatedPage });
    triggerAutoSave(get);
  },

  updateProjectSettings: async (settings) => {
    const { project } = get();
    if (!project) return;

    const { name, ...otherSettings } = settings;
    const newSettings = { ...(project.settings || {}), ...otherSettings };
    const updatedProject = { ...project, name: name || project.name, settings: newSettings };
    
    set({ project: updatedProject });

    const { user } = get();
    if (user) {
      const { error } = await supabase.from('projects')
        .update({ name: updatedProject.name, settings: newSettings })
        .eq('id', project.id);

      if (error) console.error('FAILED to save project settings:', error);
    } else {
      triggerAutoSave(get);
    }
  },

  initialize: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, isInitialized: true });
  },

  setUser: (user) => set({ user }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, project: null, projectPages: [], currentPage: null });
  },

  addBlock: (type) => {
    const { currentPage, project } = get();
    if (!currentPage || !project) return;

    const appearance = project.settings?.appearance || 'light';
    const themeBg = appearance === 'dark' ? (project.settings?.themeColors?.dark?.bg || '#09090b') : (project.settings?.themeColors?.light?.bg || '#ffffff');
    const themeText = appearance === 'dark' ? (project.settings?.themeColors?.dark?.text || '#ffffff') : (project.settings?.themeColors?.light?.text || '#000000');

    const DEFAULTS: Record<string, { content: any; style: any }> = {
      'hero': {
        content: { 
          title: 'Benvenuti nel Futuro', 
          subtitle: 'Un design minimalista ed elegante per la tua brand identity. Ogni dettaglio è curato per massimizzare l\'impatto visivo.', 
          cta: 'Esplora Ora',
          logoLinkHome: true
        },
        style: { minHeight: 700, padding: 100, align: 'center', backgroundColor: themeBg, textColor: themeText, backgroundSize: 'cover', overlayOpacity: 40, overlayColor: '#000000' }
      },
      'navigation': {
        content: { logoText: project.name || 'SitiVetrina', logoType: 'text', logoSize: 40, logoTextSize: 24, links: [{ label: 'Home', url: '/' }, { label: 'Chi Siamo', url: '/chi-siamo' }], cta: 'Inizia Ora', showContact: true, logoLinkHome: true },
        style: { padding: 0, backgroundColor: 'transparent', textColor: themeText, fontSize: 14 }
      },
      'text': {
        content: { text: 'Inserisci qui il tuo contenuto testuale. Puoi formattarlo come preferisci.' },
        style: { padding: 60, align: 'center', maxWidth: 800, backgroundColor: themeBg, textColor: themeText }
      },
      'image': {
        content: { image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', alt: 'Placeholder' },
        style: { padding: 40, borderRadius: 32, backgroundColor: themeBg }
      },
      'image-text': {
        content: { title: 'Distinguiti dalla massa', text: 'Offriamo soluzioni digitali su misura per far crescere il tuo business in modo sostenibile e innovativo.', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f', imageSide: 'left', cta: 'Scopri di più' },
        style: { padding: 80, backgroundColor: themeBg, textColor: themeText }
      },
      'features': {
        content: { 
          items: [
            { title: 'Qualità', description: 'Design curato in ogni minimo dettaglio.', icon: 'award' }, 
            { title: 'Velocità', description: 'Performance ottimizzate per ogni dispositivo.', icon: 'zap' }, 
            { title: 'Supporto', description: 'Siamo al tuo fianco per ogni necessità.', icon: 'heart' }
          ] 
        },
        style: { padding: 80, cardStyle: 'elevated', backgroundColor: themeBg, textColor: themeText }
      },
      'reviews': {
        content: { 
          title: 'Cosa dicono di noi', 
          subtitle: 'Le esperienze dei nostri partner e clienti.',
          items: [
            { name: 'Marco Rossi', text: 'Un servizio impeccabile, oltre le aspettative.', role: 'CEO @ TechLog', image: 'https://i.pravatar.cc/150?u=1' },
            { name: 'Elena Bianchi', text: 'Hanno trasformato la nostra visione in realtà.', role: 'Designer', image: 'https://i.pravatar.cc/150?u=2' }
          ]
        },
        style: { padding: 80, backgroundColor: themeBg, textColor: themeText, gap: 32 }
      },
      'gallery': {
        content: { 
          items: [
            { url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174', title: 'Modern Office' }, 
            { url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0', title: 'Collaborative Workspace' },
            { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c', title: 'Creative Team' }
          ],
          columns: 3,
          showTitles: true,
          aspectRatio: 'square'
        },
        style: { padding: 80, backgroundColor: themeBg, borderRadius: 24 }
      },
      'contact': {
        content: { title: 'Lavoriamo Insieme', subtitle: 'Hai un progetto in mente? Parliamone.', email: 'hello@example.com', phone: '+39 02 1234567', address: 'Milano, Italia' },
        style: { padding: 100, backgroundColor: themeBg, textColor: themeText, align: 'center' }
      },
      'footer': {
        content: { logoText: project.name || 'SitiVetrina', copyright: `© ${new Date().getFullYear()} ${project.name || 'SitiVetrina'}`, layout: 'columns' },
        style: { padding: 60, backgroundColor: themeBg, textColor: themeText }
      }
    };

    const d = DEFAULTS[type] || { content: {}, style: { padding: 40, align: 'center', backgroundColor: themeBg, textColor: themeText } };

    const newBlock: Block = {
      id: uuidv4(),
      type,
      content: d.content,
      style: d.style
    };

    set({ 
      currentPage: { ...currentPage, blocks: [...currentPage.blocks, newBlock] },
      selectedBlockId: newBlock.id
    });
    triggerAutoSave(get);
  },

  updateBlock: (id, content, style) => {
    const { currentPage, viewport } = get();
    if (!currentPage) return;

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
      return newBlock;
    });

    set({ currentPage: { ...currentPage, blocks } });
    triggerAutoSave(get);
  },

  updateBlockStyle: (id, style) => {
    const { currentPage, viewport } = get();
    if (!currentPage) return;

    const blocks = currentPage.blocks.map(b => {
      if (b.id !== id) return b;
      
      if (viewport === 'desktop') {
        return { ...b, style: { ...(b.style || {}), ...style } };
      } else {
        return {
          ...b,
          responsiveStyles: {
            ...(b.responsiveStyles || {}),
            [viewport]: { ...(b.responsiveStyles?.[viewport] || {}), ...style }
          }
        };
      }
    });

    set({ currentPage: { ...currentPage, blocks } });
    triggerAutoSave(get);
  },

  removeBlock: (id) => {
    const { currentPage } = get();
    if (!currentPage) return;

    set({ 
      currentPage: { ...currentPage, blocks: currentPage.blocks.filter(b => b.id !== id) },
      selectedBlockId: null
    });
    triggerAutoSave(get);
  },

  moveBlockUp: (id) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const idx = currentPage.blocks.findIndex(b => b.id === id);
    if (idx <= 0) return;

    const blocks = [...currentPage.blocks];
    [blocks[idx-1], blocks[idx]] = [blocks[idx], blocks[idx-1]];

    set({ currentPage: { ...currentPage, blocks } });
    triggerAutoSave(get);
  },

  moveBlockDown: (id) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const idx = currentPage.blocks.findIndex(b => b.id === id);
    if (idx === -1 || idx === currentPage.blocks.length - 1) return;

    const blocks = [...currentPage.blocks];
    [blocks[idx+1], blocks[idx]] = [blocks[idx], blocks[idx+1]];

    set({ currentPage: { ...currentPage, blocks } });
    triggerAutoSave(get);
  },

  selectBlock: (id) => set({ selectedBlockId: id }),

  syncGuestData: async () => {
    const guestData = localStorage.getItem('sv_guest_data');
    if (!guestData) return;
    try {
      const { pages, settings } = JSON.parse(guestData);
      if (pages.length > 0) {
        await supabase.from('pages').upsert(pages);
      }
      localStorage.removeItem('sv_guest_data');
    } catch (e) { console.error('Error syncing guest data', e); }
  },

  hydrateEditor: (project, pages) => set({ project, projectPages: pages })
}));
