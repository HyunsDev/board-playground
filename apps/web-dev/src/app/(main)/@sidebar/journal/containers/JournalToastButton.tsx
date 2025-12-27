'use client';

import { Inbox } from 'lucide-react';
import { toast } from 'sonner';

import { SidebarMenuItem, SidebarMenuButton } from '@workspace/ui';

export function JournalToastButton() {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={{
          children: `Toast`,
          hidden: false,
        }}
        onClick={() => toast('Hello, World!')}
        className="px-2.5 md:px-2"
      >
        <Inbox />
        <span>Toast</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
