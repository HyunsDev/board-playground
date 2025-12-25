import { cn } from '../../../utils/cn';
import { useWindow } from '../contexts/index';


export function WindowPage({
  children,
  pageId,
  className,
}: {
  children?: React.ReactNode;
  pageId: string;
  className?: string;
}) {
  const { currentPageId } = useWindow();
  if (currentPageId !== pageId) return null;
  return (
    <div className={cn('h-full min-h-0 w-full overflow-auto px-4 py-4', className)}>{children}</div>
  );
}

export function WindowPageHeader({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-2 w-full border-b px-1 py-2 font-medium', className)}>{children}</div>
  );
}
