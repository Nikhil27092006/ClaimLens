// Line icons from the artboards: 24px grid, 2px square-capped strokes in the current colour.

interface IconProps {
  size?: number;
}

function Icon({ size = 24, d }: IconProps & { d: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

/** Library drop zone. */
export function UploadIcon(props: IconProps) {
  return <Icon {...props} d="M12 16V4M6 10l6-6 6 6M4 20h16" />;
}

/** Ask composer "Send". */
export function ArrowRightIcon(props: IconProps) {
  return <Icon {...props} d="M5 12h14M13 6l6 6-6 6" />;
}

/** Evidence viewer "Close" (the artboard uses a ✕ glyph; an SVG renders the same everywhere). */
export function CloseIcon(props: IconProps) {
  return <Icon {...props} d="M6 6l12 12M18 6L6 18" />;
}
