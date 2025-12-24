'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useWorkbenchContext } from 'src/layouts/workbench/contexts/workbenchContext.js';

import { Sidebar, useSidebar } from '@/components/sidebar.js';
import { cn } from '@/lib/utils.js';

export function WorkbenchSidebarArea({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar
      collapsible="icon"
      className="group-data-[side=left]:border-r-workbench-background overflow-hidden transition-[border-color] duration-300 ease-in-out *:data-[sidebar=sidebar]:relative *:data-[sidebar=sidebar]:flex-row *:data-[sidebar=sidebar]:overflow-visible"
    >
      {children}
      <WorkbenchSidebarResizeHandle />
    </Sidebar>
  );
}

function WorkbenchSidebarResizeHandle() {
  const { sidebarWidth, setSidebarWidth, sidebarMinWidth, sidebarMaxWidth, resetSidebarWidth } =
    useWorkbenchContext();
  const { state, isMobile } = useSidebar();
  const handleRef = useRef<HTMLDivElement | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const moveListenerRef = useRef<((event: PointerEvent) => void) | null>(null);
  const upListenerRef = useRef<((event: PointerEvent) => void) | null>(null);
  const sidebarElementRef = useRef<HTMLElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isCollapsed = state === 'collapsed';

  const stopDragging = useCallback(() => {
    if (pointerIdRef.current !== null && handleRef.current) {
      handleRef.current.releasePointerCapture(pointerIdRef.current);
    }

    if (moveListenerRef.current) {
      document.removeEventListener('pointermove', moveListenerRef.current);
      moveListenerRef.current = null;
    }

    if (upListenerRef.current) {
      document.removeEventListener('pointerup', upListenerRef.current);
      upListenerRef.current = null;
    }

    if (sidebarElementRef.current) {
      sidebarElementRef.current.removeAttribute('data-resizing');
      sidebarElementRef.current = null;
    }

    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');

    pointerIdRef.current = null;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    return () => {
      stopDragging();
    };
  }, [stopDragging]);

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const delta = event.clientX - startXRef.current;
      setSidebarWidth(startWidthRef.current + delta);
    },
    [setSidebarWidth],
  );

  const handlePointerUp = useCallback(() => {
    stopDragging();
  }, [stopDragging]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || isCollapsed) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      pointerIdRef.current = event.pointerId;
      startXRef.current = event.clientX;
      startWidthRef.current = sidebarWidth;

      handleRef.current = event.currentTarget;
      event.currentTarget.setPointerCapture(event.pointerId);

      const sidebarElement = event.currentTarget.closest<HTMLElement>("[data-slot='sidebar']");
      if (sidebarElement) {
        sidebarElement.setAttribute('data-resizing', 'true');
        sidebarElementRef.current = sidebarElement;
      }

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      moveListenerRef.current = handlePointerMove;
      upListenerRef.current = handlePointerUp;

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);

      setIsDragging(true);
    },
    [handlePointerMove, handlePointerUp, isCollapsed, sidebarWidth],
  );

  const handleDoubleClick = useCallback(() => {
    if (isCollapsed) {
      return;
    }
    resetSidebarWidth();
  }, [isCollapsed, resetSidebarWidth]);

  const ariaValueNow = useMemo(() => Math.round(sidebarWidth), [sidebarWidth]);

  if (isMobile) {
    return null;
  }

  return (
    <div
      ref={handleRef}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={ariaValueNow}
      aria-valuemin={sidebarMinWidth}
      aria-valuemax={sidebarMaxWidth}
      className={cn(
        'absolute top-0 right-0 z-30 flex h-full w-3 cursor-col-resize items-center justify-center transition-opacity duration-150 ease-in-out select-none',
        'hover:opacity-100',
        isDragging ? 'opacity-100' : 'opacity-0',
        isCollapsed && 'pointer-events-none opacity-0',
      )}
      title="사이드바 너비 조절 (더블클릭으로 초기화)"
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      <span
        className={cn(
          'bg-sidebar-foreground h-16 w-1 rounded opacity-30 transition-opacity duration-150 ease-in-out',
          isDragging && 'opacity-70',
        )}
      />
    </div>
  );
}
