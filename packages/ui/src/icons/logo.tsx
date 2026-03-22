import type { IconProps } from "./icon-props";

export function LogoIcon(props: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" {...props}>
      <title>Logo</title>
      <rect width="16" height="16" fill="var(--primary)" rx="2" ry="2" />
      <path d="M4 8 L8 4 L12 8 M4 12 L8 8 L12 12" stroke="var(--secondary)" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
