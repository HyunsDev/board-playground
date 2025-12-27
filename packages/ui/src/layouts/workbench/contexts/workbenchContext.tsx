'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const SIDEBAR_WIDTH_STORAGE_KEY = 'workbench_sidebar_width';
const SIDEBAR_DEFAULT_WIDTH = 300;
const SIDEBAR_MIN_WIDTH = 300;
const SIDEBAR_MAX_WIDTH = 480;

const clampWidth = (width: number) =>
  Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));

export type WorkbenchContextType = {
  sidebarWidth: number;
  setSidebarWidth: (width: number | ((previous: number) => number)) => void;
  sidebarMinWidth: number;
  sidebarMaxWidth: number;
  resetSidebarWidth: () => void;
};

export const WorkbenchContext = createContext<WorkbenchContextType | null>(null);

export function WorkbenchContextProvider({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidthState] = useState(SIDEBAR_DEFAULT_WIDTH);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const storedWidth = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
      if (!storedWidth) {
        return;
      }

      const parsedWidth = Number.parseInt(storedWidth, 10);
      if (Number.isNaN(parsedWidth)) {
        return;
      }

      setSidebarWidthState(clampWidth(parsedWidth));
    } catch {
      // ignore read errors (e.g. private mode)
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(sidebarWidth));
    } catch {
      // ignore write errors
    }
  }, [sidebarWidth]);

  const setSidebarWidth = useCallback<WorkbenchContextType['setSidebarWidth']>((value) => {
    setSidebarWidthState((previous) => {
      const nextWidth = clampWidth(typeof value === 'function' ? value(previous) : value);
      return nextWidth;
    });
  }, []);

  const resetSidebarWidth = useCallback(() => {
    setSidebarWidthState(SIDEBAR_DEFAULT_WIDTH);
  }, []);

  const contextValue = useMemo<WorkbenchContextType>(
    () => ({
      sidebarWidth,
      setSidebarWidth,
      sidebarMinWidth: SIDEBAR_MIN_WIDTH,
      sidebarMaxWidth: SIDEBAR_MAX_WIDTH,
      resetSidebarWidth,
    }),
    [sidebarWidth, setSidebarWidth, resetSidebarWidth],
  );

  return <WorkbenchContext.Provider value={contextValue}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbenchContext() {
  const context = useContext(WorkbenchContext);
  if (!context) {
    throw new Error('useWorkbenchContext must be used within a WorkbenchContextProvider.');
  }

  return context;
}
