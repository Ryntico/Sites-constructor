interface CursorTextIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export const IconCursorText: React.FC<CursorTextIconProps> = ({
  size = 28,
  style,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      {...props}
    >
      <path d="M10 12h4" />
      <path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3" />
      <path d="M15 4a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3" />
    </svg>
  );
};

IconCursorText.displayName = 'CursorTextIcon';
