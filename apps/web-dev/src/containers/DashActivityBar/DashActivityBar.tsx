'use client';

import Link from 'next/link';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
} from '@workspace/ui';
import { WorkbenchActivityBar, WorkbenchActivityBarMenuItem } from '@workspace/ui';

import { NavUser } from './NavUser';

import { DashIcon } from '@/components/DashIcon';
import { useView } from '@/contexts/ViewContext';

const ViewNotice: { [key: string]: boolean } = {
  dashboard: false,
  journal: true,
  memo: true,
};

export function DashActivityBar() {
  const { currentView, setCurrentView, views } = useView();

  return (
    <WorkbenchActivityBar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <DashIcon className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-0">
            <SidebarMenu className="gap-2">
              {views
                .filter((view) => view.isVisibleInViewList)
                .map((view) => (
                  <WorkbenchActivityBarMenuItem
                    key={view.id}
                    title={view.title}
                    icon={view.icon}
                    isActive={currentView?.id === view.id}
                    onClick={() => setCurrentView(view.id)}
                    hasNotification={ViewNotice[view.id]}
                  />
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </WorkbenchActivityBar>
  );
}
