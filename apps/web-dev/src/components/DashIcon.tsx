import { cn } from '@workspace/ui';

export function DashIcon({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={cn(className)}
      {...props}
    >
      <defs>
        <clipPath id="horizontalClip">
          <rect x="0" y="2.67" width="24" height="10.67" />
        </clipPath>
      </defs>
      <g transform="translate(0,4)" clipPath="url(#horizontalClip)">
        <path
          d="M4 1.33 L9.33 8 L4 14.67"
          strokeWidth="3"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          fill="none"
        />
        <path
          d="M9.33 1.33 L14.67 8 L9.33 14.67"
          strokeWidth="3"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          fill="none"
        />
        <path
          d="M14.67 1.33 L20 8 L14.67 14.67"
          strokeWidth="3"
          strokeLinecap="butt"
          strokeLinejoin="miter"
          fill="none"
        />
      </g>
    </svg>
  );
}
