'use client';

import React from 'react';

import { SidebarProvider } from '@/components/sidebar';
import { useWorkbenchContext } from '@/layouts/workbench/contexts/workbenchContext';

export function Workbench({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useWorkbenchContext();

  return (
    <div className="bg-workbench-background fixed top-0 left-0 h-dvh w-dvw">
      <SidebarProvider
        style={
          {
            '--sidebar-width': `${sidebarWidth}px`,
          } as React.CSSProperties
        }
      >
        {children}
      </SidebarProvider>
    </div>
  );
}
