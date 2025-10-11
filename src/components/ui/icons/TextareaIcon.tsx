export function IconTextarea(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="32"
			height="32"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
			aria-hidden="true"
		>
			<path d="M5 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
			<path d="M19 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
			<path d="M5 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
			<path d="M19 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
			<path d="M5 7v10" />
			<path d="M7 5h10" />
			<path d="M7 19h10" />
			<path d="M19 7v10" />
			<path d="M10 10h4" />
			<path d="M12 14v-4" />
		</svg>
	);
}