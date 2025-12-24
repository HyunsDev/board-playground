import { WorkbenchContextProvider } from '../../contexts/workbenchContext';

export function WorkbenchProvider({ children }: { children: React.ReactNode }) {
  return <WorkbenchContextProvider>{children}</WorkbenchContextProvider>;
}
