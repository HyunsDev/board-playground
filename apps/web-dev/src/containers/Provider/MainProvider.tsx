// import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { Toaster } from '@workspace/ui';
import { WorkbenchProvider } from '@workspace/ui';

import { ViewContextProvider } from '@/contexts/ViewContext';

export function MainProvider({ children }: { children: React.ReactNode }) {
  return (
    // <NextThemesProvider
    //   attribute="class"
    //   defaultTheme="system"
    //   enableSystem
    //   disableTransitionOnChange
    //   enableColorScheme
    // >
    <WorkbenchProvider>
      <ViewContextProvider>
        {children}
        <Toaster />
      </ViewContextProvider>
    </WorkbenchProvider>
    // </NextThemesProvider>
  );
}
