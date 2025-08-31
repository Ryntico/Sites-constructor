import React from 'react';

export function InspectorGrid({
								  cols = 2,
								  children,
								  style,
							  }: {
	cols?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<div
			style={{
				display: 'grid',
				gap: 8,
				gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
				...(style || {}),
			}}
		>
			{children}
		</div>
	);
}