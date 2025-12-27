'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { View, findViewById, findViewByPath, views as registeredViews } from '@/data/views';

export type ViewContextValue = {
  currentView: View | null;
  setCurrentView: (viewId: string) => void;
  views: View[];
  isKnownPath: (pathname: string | null | undefined) => boolean;
};

export const ViewContext = createContext<ViewContextValue | undefined>(undefined);

export function ViewContextProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const currentView = useMemo(() => findViewByPath(pathname), [pathname]);

  const setCurrentView = useCallback(
    (viewId: string) => {
      const nextView = findViewById(viewId);

      if (!nextView) {
        console.warn(`[ViewContext] Attempted to navigate to unknown view "${viewId}".`);
        return;
      }

      if (currentView?.id === nextView.id) {
        return;
      }

      router.push(nextView.href);
    },
    [currentView?.id, router],
  );

  const isKnownPath = useCallback(
    (path: string | null | undefined) => findViewByPath(path) !== null,
    [],
  );

  const value = useMemo<ViewContextValue>(
    () => ({
      currentView,
      setCurrentView,
      views: registeredViews,
      isKnownPath,
    }),
    [currentView, isKnownPath, setCurrentView],
  );

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView(): ViewContextValue {
  const context = useContext(ViewContext);

  if (!context) {
    throw new Error('useView must be used within a ViewContextProvider.');
  }

  return context;
}
