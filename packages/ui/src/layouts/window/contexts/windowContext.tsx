'use client';

import * as React from 'react';

export type WindowContextType = {
  currentPageId: string;
  setCurrentPageId: (pageId: string) => void;
};
export const WindowContext = React.createContext<WindowContextType | null>(null);

export function WindowContextProvider({
  children,
  defaultPageId,
}: {
  children: React.ReactNode;
  defaultPageId: string;
}) {
  const [currentPageId, setCurrentPageId] = React.useState(defaultPageId);

  const contextValue = React.useMemo<WindowContextType>(
    () => ({
      currentPageId,
      setCurrentPageId,
    }),
    [currentPageId],
  );

  return <WindowContext.Provider value={contextValue}>{children}</WindowContext.Provider>;
}

export function useWindow() {
  const context = React.useContext(WindowContext);
  if (!context) {
    throw new Error('useWindow must be used within a WindowContextProvider.');
  }

  return context;
}
