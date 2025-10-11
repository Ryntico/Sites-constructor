export function IconAnchor(props: React.SVGProps<SVGSVGElement>) {
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
			<path d="M12 9v12m-8 -8a8 8 0 0 0 16 0m1 0h-2m-14 0h-2" />
			<path d="M12 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
		</svg>
	);
}