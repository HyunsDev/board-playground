import { Geist, Geist_Mono } from 'next/font/google';

import '@workspace/ui/globals.css';
import {
  Workbench,
  WorkbenchContentArea,
  WorkbenchSidebarArea,
  WorkbenchPanelGroup,
} from '@workspace/ui';

import { DashActivityBar } from '@/containers/DashActivityBar';
import { MainProvider } from '@/containers/Provider/MainProvider';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
  sidebar,
}: Readonly<{
  children: React.ReactNode;
  sidebar: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}>
        <MainProvider>
          <Workbench>
            <WorkbenchSidebarArea>
              <DashActivityBar />
              {sidebar}
            </WorkbenchSidebarArea>
            <WorkbenchContentArea>
              <WorkbenchPanelGroup>{children}</WorkbenchPanelGroup>
            </WorkbenchContentArea>
          </Workbench>
        </MainProvider>
      </body>
    </html>
  );
}
