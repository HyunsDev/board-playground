import { Inbox } from 'lucide-react';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@workspace/ui';
import { WorkbenchSidebar, WorkbenchSidebarHeader } from '@workspace/ui';

import { JournalToastButton } from './containers/JournalToastButton';

export default function Page() {
  return (
    <WorkbenchSidebar>
      <WorkbenchSidebarHeader title="Dashboard" />
      <SidebarContent className="gap-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{
                    children: `Inbox`,
                    hidden: false,
                  }}
                  isActive={true}
                  className="px-2.5 md:px-2"
                >
                  <Inbox />
                  <span>Journal</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <JournalToastButton />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </WorkbenchSidebar>
  );
}
