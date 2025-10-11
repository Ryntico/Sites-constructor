export function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
			aria-hidden="true"
		>
			<path d="M15 18L9 12L15 6" />
		</svg>
	);
}