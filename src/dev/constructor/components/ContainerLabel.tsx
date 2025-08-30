import React, { type CSSProperties } from 'react';

export function ContainerLabel({
	type,
	base,
}: {
	type: string;
	base: CSSProperties;
}): React.ReactElement {
	const dir = (base.flexDirection as string | undefined)?.startsWith('column')
		? 'column'
		: 'row';
	const text =
		type === 'box'
			? `box (${dir})`
			: type === 'row'
				? 'row'
				: type === 'section'
					? 'section'
					: type === 'page'
						? 'page'
						: type === 'form'
							? 'form'
							: type;

	return (
		<span
			style={{
				position: 'absolute',
				top: 2,
				left: 2,
				fontSize: 9,
				lineHeight: '14px',
				padding: '0 2px',
				borderRadius: 999,
				background: 'rgba(15,23,42,.06)',
				color: '#4b5563',
				pointerEvents: 'none',
				zIndex: 4,
			}}
		>
			{text}
		</span>
	);
}
