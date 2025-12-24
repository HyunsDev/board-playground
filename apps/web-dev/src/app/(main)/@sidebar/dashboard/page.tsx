'use client';

import { Cog, Command, GalleryVerticalEnd, Inbox, Monitor, UserIcon } from 'lucide-react';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@workspace/ui';
import { WorkbenchSidebar, WorkbenchSidebarHeader } from '@workspace/ui';
import { Button } from '@workspace/ui';
import { Dialog, DialogTrigger } from '@workspace/ui';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@workspace/ui';
import {
  Window,
  WindowContent,
  WindowPage,
  WindowPageHeader,
  WindowSidebar,
  WindowSidebarContent,
  WindowSidebarFooter,
  WindowSidebarGroup,
  WindowSidebarGroupContent,
  WindowSidebarHeader,
  WindowSidebarMenu,
  WindowSidebarMenuButton,
  WindowSidebarMenuItem,
} from '@workspace/ui';

function ExampleWindow() {
  return (
    <Window defaultPageId="home" srTitle="Setting">
      <WindowSidebar>
        <WindowSidebarHeader>
          <WindowSidebarMenu>
            <WindowSidebarMenuItem>
              <WindowSidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Command className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">Acme Inc</span>
                    <span className="truncate text-xs">Enterprise</span>
                  </div>
                </a>
              </WindowSidebarMenuButton>
            </WindowSidebarMenuItem>
          </WindowSidebarMenu>
        </WindowSidebarHeader>
        <WindowSidebarContent>
          <WindowSidebarGroup>
            <WindowSidebarGroupContent>
              <WindowSidebarMenu>
                <WindowSidebarMenuItem>
                  <WindowSidebarMenuButton to="home">
                    <UserIcon />
                    <span>이름</span>
                  </WindowSidebarMenuButton>
                </WindowSidebarMenuItem>
                <WindowSidebarMenuItem>
                  <WindowSidebarMenuButton to="display">
                    <Monitor />
                    <span>디스플레이</span>
                  </WindowSidebarMenuButton>
                </WindowSidebarMenuItem>
                <WindowSidebarMenuItem>
                  <WindowSidebarMenuButton to="overflow">
                    <GalleryVerticalEnd />
                    <span>Overflow</span>
                  </WindowSidebarMenuButton>
                </WindowSidebarMenuItem>
              </WindowSidebarMenu>
            </WindowSidebarGroupContent>
          </WindowSidebarGroup>
        </WindowSidebarContent>
        <WindowSidebarFooter>
          <div className="px-1 flex-1 text-left leading-tight">
            <span className="truncate font-medium text-xs text-foreground-inactive">
              Hyuns Dash v0.0.0
            </span>
          </div>
        </WindowSidebarFooter>
      </WindowSidebar>
      <WindowContent>
        <WindowPage pageId="home">
          <WindowPageHeader>Title 제목</WindowPageHeader>
          <Item>
            <ItemContent>
              <ItemTitle>Default Variant</ItemTitle>
              <ItemDescription>
                Standard styling with subtle background and borders.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                Open
              </Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Default Variant</ItemTitle>
              <ItemDescription>
                Standard styling with subtle background and borders.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                Open
              </Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Default Variant</ItemTitle>
              <ItemDescription>
                Standard styling with subtle background and borders.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                Open
              </Button>
            </ItemActions>
          </Item>
        </WindowPage>
        <WindowPage pageId="display">
          <WindowPageHeader>Display</WindowPageHeader>
        </WindowPage>
        <WindowPage pageId="overflow">
          <WindowPageHeader>Overflow</WindowPageHeader>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {Array.from({ length: 24 }).map((_, index) => (
              <div key={index} className="bg-muted/50 aspect-video h-12 w-full rounded-lg" />
            ))}
          </div>
        </WindowPage>
      </WindowContent>
    </Window>
  );
}

export default function Page() {
  return (
    <WorkbenchSidebar>
      <WorkbenchSidebarHeader title="Dashboard" />
      <SidebarContent>
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
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <Dialog>
                <DialogTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip={{
                        children: `Inbox`,
                        hidden: false,
                      }}
                      isActive={false}
                      className="px-2.5 md:px-2"
                    >
                      <Cog />
                      <span>Setting</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </DialogTrigger>
                <ExampleWindow />
              </Dialog>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </WorkbenchSidebar>
  );
}
