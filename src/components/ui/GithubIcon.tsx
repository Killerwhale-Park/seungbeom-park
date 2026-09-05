export type IconProps = {
  size?: number;
  strokeWidth?: number;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

// lucide-react v1 removed brand marks, so the GitHub glyph is inlined here.
export function GithubIcon({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      {...rest}
    >
      <path d="M12 .5C5.73.5.9 5.48.9 11.92c0 5.05 3.29 9.33 7.86 10.84.57.11.78-.26.78-.57l-.02-2c-3.2.71-3.87-1.42-3.87-1.42-.52-1.37-1.28-1.73-1.28-1.73-1.05-.73.08-.72.08-.72 1.16.08 1.77 1.22 1.77 1.22 1.03 1.81 2.7 1.29 3.36.99.1-.77.4-1.29.73-1.59-2.55-.3-5.24-1.31-5.24-5.83 0-1.29.44-2.34 1.17-3.16-.12-.3-.51-1.5.11-3.13 0 0 .96-.32 3.15 1.2a10.6 10.6 0 0 1 5.74 0c2.18-1.52 3.14-1.2 3.14-1.2.62 1.63.23 2.83.12 3.13.73.82 1.17 1.87 1.17 3.16 0 4.53-2.7 5.53-5.26 5.82.41.37.78 1.09.78 2.2l-.01 3.26c0 .31.2.68.79.57 4.56-1.51 7.85-5.79 7.85-10.84C23.1 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}
