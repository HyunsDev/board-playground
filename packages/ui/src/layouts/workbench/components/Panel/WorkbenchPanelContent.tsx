export function WorkbenchPanelContent({ children }: { children: React.ReactNode }) {
  return <div className="min-h-0 flex-1 overflow-auto">{children}</div>;
}
