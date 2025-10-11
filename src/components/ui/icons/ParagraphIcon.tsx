export function IconParagraph(props: React.SVGProps<SVGSVGElement>) {
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
			<path d="M13 4v16" />
			<path d="M17 4v16" />
			<path d="M19 4h-9.5a4.5 4.5 0 0 0 0 9h3.5" />
		</svg>
	);
}