export function IconButton(props: React.SVGProps<SVGSVGElement>) {
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
			<path d="M3 6m0 6a6 6 0 0 1 6 -6h6a6 6 0 0 1 6 6v0a6 6 0 0 1 -6 6h-6a6 6 0 0 1 -6 -6z" />
		</svg>
	);
}