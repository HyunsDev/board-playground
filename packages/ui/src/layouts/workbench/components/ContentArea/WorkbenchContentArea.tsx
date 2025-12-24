import { cn } from '../../../../utils/cn';

export function WorkbenchContentArea({ className, ...props }: React.ComponentPropsWithoutRef<'main'>) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        'relative z-10 flex w-full flex-1 px-2 md:pl-0',
        'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
        className,
      )}
      {...props}
    />
  );
}
