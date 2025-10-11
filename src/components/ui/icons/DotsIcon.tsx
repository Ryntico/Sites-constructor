export function IconDots(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 14 14"
			fill="currentColor"
			{...props}
			aria-hidden="true"
		>
			<circle cx="4" cy="3" r="1.2" />
			<circle cx="4" cy="7" r="1.2" />
			<circle cx="4" cy="11" r="1.2" />
		</svg>
	);
}