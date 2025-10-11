export function IconBoxCard(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
			aria-hidden="true"
		>
			<path d="M4 7l16 0" />
			<path d="M4 17l16 0" />
			<path d="M7 4l0 16" />
			<path d="M17 4l0 16" />
		</svg>
	);
}