'use client';

import { Separator } from '@/components/separator';
import { SidebarTrigger, useSidebar } from '@/components/sidebar';

export function WorkbenchPanelHeader({
  children,
  sidebarButtonMode = 'auto',
}: {
  children: React.ReactNode;
  sidebarButtonMode?: 'show' | 'auto' | 'hide';
}) {
  const { open } = useSidebar();

  return (
    <header className="bg-background flex h-10 shrink-0 items-center border-b px-2">
      {sidebarButtonMode === 'show' || (sidebarButtonMode === 'auto' && !open) ? (
        <div className="flex items-center gap-1">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        </div>
      ) : null}
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </header>
  );
}
