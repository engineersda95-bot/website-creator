'use client';

import React from 'react';
import { RichTextareaProps } from '@/types/sidebar';
import { RichEditor } from './RichEditor';

export function RichTextarea(props: RichTextareaProps) {
   return <RichEditor {...props} />;
}

