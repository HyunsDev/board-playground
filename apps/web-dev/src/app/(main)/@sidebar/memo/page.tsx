import { Archive, StickyNote } from 'lucide-react';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@workspace/ui';
import { WorkbenchSidebar, WorkbenchSidebarHeader } from '@workspace/ui';

export default function Page() {
  return (
    <WorkbenchSidebar>
      <WorkbenchSidebarHeader title="Dashboard" />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={true} className="px-2.5 md:px-2">
                  <StickyNote />
                  <span>Memo</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton className="px-2.5 md:px-2">
                  <Archive />
                  <span>Archived</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </WorkbenchSidebar>
  );
}
