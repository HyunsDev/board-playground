import localFont from 'next/font/local';

import '@workspace/ui/globals.css';
import {
  Workbench,
  WorkbenchContentArea,
  WorkbenchSidebarArea,
  WorkbenchPanelGroup,
} from '@workspace/ui';

import { DashActivityBar } from '@/containers/AppActivityBar';
import { MainProvider } from '@/containers/Provider/MainProvider';

const fontSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-sans',
});

const fontMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
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
