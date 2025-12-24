'use client';

import { createContext, useContext, useMemo, useState } from 'react';

export type WindowContextType = {
  currentPageId: string;
  setCurrentPageId: (pageId: string) => void;
};
export const WindowContext = createContext<WindowContextType | null>(null);

export function WindowContextProvider({
  children,
  defaultPageId,
}: {
  children: React.ReactNode;
  defaultPageId: string;
}) {
  const [currentPageId, setCurrentPageId] = useState(defaultPageId);

  const contextValue = useMemo<WindowContextType>(
    () => ({
      currentPageId,
      setCurrentPageId,
    }),
    [currentPageId],
  );

  return <WindowContext.Provider value={contextValue}>{children}</WindowContext.Provider>;
}

export function useWindow() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindow must be used within a WindowContextProvider.');
  }

  return context;
}
