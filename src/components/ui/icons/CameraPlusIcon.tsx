export function IconCameraPlus(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="48"
			height="48"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
			aria-hidden="true"
		>
			<path d="M12 13a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z" />
			<path d="M5 7h2a2 2 0 0 0 2-2a1 1 0 0 1 1-1h2m9 7v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2" />
			<path d="M15 6h6v6h-6z" />
		</svg>
	);
}