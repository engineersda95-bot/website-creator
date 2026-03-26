'use client';

import { useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export function useEditorShortcuts() {
  const {
    saveCurrentPage,
    undo,
    redo,
    selectedBlockId,
    copyBlock,
    pasteBlock,
    duplicateBlock,
    hasUnsavedChanges
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName) || (e.target as HTMLElement).isContentEditable;
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl) {
        const key = e.key.toLowerCase();

        if (key === 's') {
          e.preventDefault();
          if (hasUnsavedChanges) saveCurrentPage();
        } else if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) redo();
          else undo();
        } else if (key === 'y') {
          e.preventDefault();
          redo();
        } else if (key === 'c' && selectedBlockId && !isInput) {
          e.preventDefault();
          copyBlock(selectedBlockId);
        } else if (key === 'v' && !isInput) {
          e.preventDefault();
          pasteBlock();
        } else if (key === 'd' && selectedBlockId && !isInput) {
          e.preventDefault();
          duplicateBlock(selectedBlockId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [
    saveCurrentPage, 
    undo, 
    redo, 
    selectedBlockId, 
    copyBlock, 
    pasteBlock, 
    duplicateBlock, 
    hasUnsavedChanges
  ]);
}
