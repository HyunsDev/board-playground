import { WorkbenchContextProvider } from 'src/layouts/workbench/contexts/workbenchContext';

export function WorkbenchProvider({ children }: { children: React.ReactNode }) {
  return <WorkbenchContextProvider>{children}</WorkbenchContextProvider>;
}
