'use client';

import { ToastContainer } from './Toast';
import { ConfirmDialogContainer } from './ConfirmDialog';

export function GlobalDialogs() {
  return (
    <>
      <ToastContainer />
      <ConfirmDialogContainer />
    </>
  );
}
