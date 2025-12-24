import { Sidebar } from '@/components/sidebar';

export function WorkbenchSidebar({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar collapsible="none" className="hidden flex-1 md:flex">
      {children}
    </Sidebar>
  );
}
