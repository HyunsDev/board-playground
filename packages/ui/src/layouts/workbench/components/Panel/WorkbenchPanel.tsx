import { cn } from '@/lib/utils';

export function WorkbenchPanel({
  children,
  className,
  maxWidth,
}: {
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div
      className={cn(
        'bg-workbench-background flex h-full max-h-dvh w-full min-w-0 flex-1 flex-col px-0 pt-0',
      )}
      style={{
        maxWidth: maxWidth,
      }}
    >
      <div className="window-draggable h-2.5 w-full"></div>
      <div
        className={cn(
          'bg-background relative flex h-full max-h-[calc(100dvh-20px)] min-w-0 flex-col overflow-hidden rounded-lg border shadow-lg',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
