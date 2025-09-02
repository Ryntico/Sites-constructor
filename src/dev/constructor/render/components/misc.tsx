import React from 'react';

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
	return <img style={base} src={src} alt={alt ?? ''} {...dataAttrs} />;
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
