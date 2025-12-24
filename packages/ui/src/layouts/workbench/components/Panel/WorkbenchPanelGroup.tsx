'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

const HANDLE_SIZE_PX = 12;
const DEFAULT_MIN_PANEL_WIDTH = 200;

type WorkbenchPanelGroupProps = {
  children: React.ReactNode;
  className?: string;
  minPanelWidth?: number;
};

type DragState = {
  index: number;
  pointerId: number;
  startX: number;
  initialSizes: number[];
  availableWidth: number;
};

export function WorkbenchPanelGroup({
  children,
  className,
  minPanelWidth = DEFAULT_MIN_PANEL_WIDTH,
}: WorkbenchPanelGroupProps) {
  const childArray = React.Children.toArray(children).filter(
    (child) => child !== null && child !== undefined,
  );
  const count = childArray.length;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef<DragState | null>(null);
  const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);
  const [sizes, setSizes] = React.useState<number[]>(() =>
    count > 0 ? Array(count).fill(1 / count) : [],
  );

  const sizesRef = React.useRef(sizes);
  React.useEffect(() => {
    sizesRef.current = sizes;
  }, [sizes]);

  React.useEffect(() => {
    if (count === 0) {
      setSizes([]);
      return;
    }

    setSizes((prev) => {
      if (prev.length === count) {
        return prev;
      }

      if (prev.length === 0) {
        return Array(count).fill(1 / count);
      }

      const trimmed = prev.slice(0, count);
      const trimmedTotal = trimmed.reduce((total, value) => total + value, 0);
      const normalized =
        trimmedTotal > 0
          ? trimmed.map((value) => value / trimmedTotal)
          : Array(count).fill(1 / count);

      if (normalized.length === count) {
        return normalized;
      }

      const remainingCount = count - normalized.length;
      const remainingShare =
        (1 - normalized.reduce((total, value) => total + value, 0)) / remainingCount;
      const appended = Array(remainingCount).fill(
        Number.isFinite(remainingShare) ? remainingShare : 1 / count,
      );
      const next = [...normalized, ...appended];
      const nextTotal = next.reduce((total, value) => total + value, 0);

      return nextTotal > 0 ? next.map((value) => value / nextTotal) : Array(count).fill(1 / count);
    });
  }, [count]);

  const stopDragging = React.useCallback(() => {
    if (dragStateRef.current?.pointerId && dragStateRef.current.index >= 0) {
      const handle = containerRef.current?.querySelector<HTMLElement>(
        `[data-panel-handle='${dragStateRef.current.index}']`,
      );
      if (handle) {
        handle.releasePointerCapture(dragStateRef.current.pointerId);
      }
    }

    dragStateRef.current = null;
    setDraggingIndex(null);
    document.body.style.removeProperty('user-select');
    document.body.style.removeProperty('cursor');
  }, []);

  React.useEffect(() => {
    return () => {
      stopDragging();
    };
  }, [stopDragging]);

  const handlePointerDown = React.useCallback(
    (index: number) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || count < 2) {
        return;
      }

      const container = containerRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const availableWidth = rect.width - HANDLE_SIZE_PX * Math.max(count - 1, 0);

      if (availableWidth <= 0) {
        return;
      }

      const initialSizes = sizesRef.current.length
        ? sizesRef.current.slice()
        : Array(count).fill(1 / count);

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);

      dragStateRef.current = {
        index,
        pointerId: event.pointerId,
        startX: event.clientX,
        initialSizes,
        availableWidth,
      };

      setDraggingIndex(index);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
    },
    [count],
  );

  const updateSizesForDrag = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      const { index, startX, availableWidth, initialSizes } = dragState;
      if (availableWidth <= 0) {
        return;
      }

      const delta = event.clientX - startX;
      const deltaRatio = delta / availableWidth;
      const pairTotalRatio = (initialSizes[index] ?? 0) + (initialSizes[index + 1] ?? 0);

      if (pairTotalRatio <= 0) {
        return;
      }

      let minRatio = minPanelWidth / availableWidth;
      if (!Number.isFinite(minRatio) || minRatio < 0) {
        minRatio = 0;
      }
      if (pairTotalRatio < minRatio * 2) {
        minRatio = pairTotalRatio / 2;
      }

      const maxLeftRatio = pairTotalRatio - minRatio;

      let leftRatio = (initialSizes[index] ?? 0) + deltaRatio;
      leftRatio = Math.min(leftRatio, maxLeftRatio);
      leftRatio = Math.max(leftRatio, minRatio);
      const rightRatio = pairTotalRatio - leftRatio;

      setSizes((prev) => {
        if (!prev.length) {
          return prev;
        }

        const next = [...prev];
        next[index] = leftRatio;
        if (index + 1 < next.length) {
          next[index + 1] = rightRatio;
        }
        return next;
      });
    },
    [minPanelWidth],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragStateRef.current) {
        return;
      }
      updateSizesForDrag(event);
    },
    [updateSizesForDrag],
  );

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      event.currentTarget.releasePointerCapture(event.pointerId);
      stopDragging();
    },
    [stopDragging],
  );

  const handlePointerCancel = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const dragState = dragStateRef.current;
      if (!dragState || event.pointerId !== dragState.pointerId) {
        return;
      }
      event.currentTarget.releasePointerCapture(event.pointerId);
      stopDragging();
    },
    [stopDragging],
  );

  const handleDoubleClick = React.useCallback(
    (index: number) => () => {
      if (count < 2) {
        return;
      }

      setSizes((prev) => {
        if (!prev.length) {
          return prev;
        }

        const next = [...prev];
        const pairTotal =
          (prev[index] ?? 0) + (index + 1 < prev.length ? (prev[index + 1] ?? 0) : 0);
        const evenShare = pairTotal / 2;
        next[index] = evenShare;
        if (index + 1 < next.length) {
          next[index + 1] = evenShare;
        }
        return next;
      });
    },
    [count],
  );

  if (count === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn('flex min-h-0 flex-1 items-stretch', className)}
      data-panel-group
    >
      {childArray.map((child, index) => {
        const key =
          (React.isValidElement(child) && child.key !== null ? child.key : index) ?? index;

        const grow = sizes[index] ?? 0;

        return (
          <React.Fragment key={key}>
            <div
              className="flex min-w-0 flex-1"
              style={{
                flexBasis: 0,
                flexGrow: grow,
              }}
              data-panel
            >
              <div className="flex min-w-0 flex-1">{child}</div>
            </div>
            {index < count - 1 ? (
              <div
                role="separator"
                aria-orientation="vertical"
                data-panel-handle={index}
                className={cn(
                  'relative flex shrink-0 items-center justify-center select-none',
                  'transition-[opacity,background] duration-150 ease-in-out',
                  'cursor-col-resize',
                  draggingIndex === index ? 'opacity-100' : 'opacity-40 hover:opacity-80',
                )}
                style={{ width: HANDLE_SIZE_PX }}
                onPointerDown={handlePointerDown(index)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                onDoubleClick={handleDoubleClick(index)}
                title="패널 너비 조절 (더블클릭으로 균등 분할)"
              >
                <span
                  className={cn(
                    'bg-sidebar-foreground h-16 w-1 rounded-full transition-opacity duration-150 ease-in-out',
                    draggingIndex === index ? 'opacity-70' : 'opacity-30',
                  )}
                />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
