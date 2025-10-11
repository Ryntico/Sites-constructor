export function IconRichText(props: React.SVGProps<SVGSVGElement>) {
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
			<path d="M3 7v-2h13v2" />
			<path d="M10 5v14" />
			<path d="M12 19h-4" />
			<path d="M15 13v-1h6v1" />
			<path d="M18 12v7" />
			<path d="M17 19h2" />
		</svg>
	);
}