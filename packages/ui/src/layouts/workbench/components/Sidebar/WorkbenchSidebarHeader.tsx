'use client';

import { Kbd } from '@/components/kbd';
import { SidebarHeader, SidebarTrigger } from '@/components/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';

export function WorkbenchSidebarHeader({ title }: { title: string }) {
  return (
    <SidebarHeader className="gap-3.5 border-b py-2 pr-2 pl-4">
      <div className="flex w-full items-center justify-between">
        <div className="text-foreground text-base font-medium">{title}</div>
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger />
          </TooltipTrigger>
          <TooltipContent>
            사이드바 접기 <Kbd>Ctrl + /</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </SidebarHeader>
  );
}
