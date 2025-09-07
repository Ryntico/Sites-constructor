import React from 'react';
import { isPercentSize } from '@components/constructor/render/helpers.ts';

type BaseProps = {
	base: React.CSSProperties;
	dataAttrs: { 'data-res-id': string };
};

export function Image({
	base,
	dataAttrs,
	src,
	alt,
}: BaseProps & { src?: string; alt?: string }) {
	const style: React.CSSProperties & Record<string, unknown> = {
		display: 'block',
		maxWidth: '100%',
		height: 'auto',
		minWidth: 0,
		...base,
	};

	const w = style.width ?? (style['w'] as string | number | undefined);
	const h = style.height ?? (style['h'] as string | number | undefined);
	if (isPercentSize(w)) {
		delete style.width;
		delete style['w'];
	}
	if (isPercentSize(h)) {
		delete style.height;
		delete style['h'];
	}

	return <img style={style} src={src} alt={alt ?? ''} {...dataAttrs} />;
}

export function Divider({ base, dataAttrs }: BaseProps) {
	return <div style={base} {...dataAttrs} />;
}

export function Anchor({ base, dataAttrs, id }: BaseProps & { id: string }) {
	return <div id={id} style={base} {...dataAttrs} />;
}

export function List({
	base,
	dataAttrs,
	as = 'ul',
	children,
}: BaseProps & { as?: 'ul' | 'ol'; children?: React.ReactNode }) {
	const Tag = as;
	return (
		<Tag style={base} {...dataAttrs}>
			{children}
		</Tag>
	);
}

export function ListItem({ base, dataAttrs, text }: BaseProps & { text?: string }) {
	return (
		<li style={base} {...dataAttrs}>
			{text ?? ''}
		</li>
	);
}
