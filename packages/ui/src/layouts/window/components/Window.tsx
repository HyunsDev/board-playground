'use client';


import { WindowSidebarProvider } from './WindowSidebar';
import { DialogContent, DialogTitle } from '../../../components/dialog';
import { WindowContextProvider } from '../contexts/index';

export type WindowProps = {
  children: React.ReactNode;
  defaultPageId: string;
  srTitle: string;
};
export function Window({ children, defaultPageId, srTitle }: WindowProps) {
  return (
    <WindowContextProvider defaultPageId={defaultPageId}>
      <DialogContent className="flex h-full max-h-[min(90dvh,720px)] w-full max-w-[min(90dvw,1100px)] gap-0 p-0">
        <WindowSidebarProvider>
          <DialogTitle className="sr-only">{srTitle}</DialogTitle>
          {children}
        </WindowSidebarProvider>
      </DialogContent>
    </WindowContextProvider>
  );
}
