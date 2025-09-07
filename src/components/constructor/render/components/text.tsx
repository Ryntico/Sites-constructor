import React from 'react';
import { clampHeading, isHtml } from '../helpers.ts';

type DataAttrs = { 'data-res-id': string };

type BaseProps = {
	base: React.CSSProperties;
	dataAttrs: DataAttrs;
};

const H_TAG: Record<1 | 2 | 3 | 4 | 5 | 6, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
	1: 'h1',
	2: 'h2',
	3: 'h3',
	4: 'h4',
	5: 'h5',
	6: 'h6',
};

export function Heading({
	level,
	text,
	base,
	dataAttrs,
}: BaseProps & { level?: unknown; text?: string }) {
	const lvl = clampHeading(level);
	const Tag = H_TAG[lvl];
	return React.createElement(Tag, { style: base, ...dataAttrs }, text ?? '');
}

export function Paragraph({ base, dataAttrs, text }: BaseProps & { text?: string }) {
	return (
		<p style={base} {...dataAttrs}>
			{text ?? ''}
		</p>
	);
}

export function RichText({ base, dataAttrs, html }: BaseProps & { html?: string }) {
	const s = html ?? '';
	return isHtml(s) ? (
		<div style={base} {...dataAttrs} dangerouslySetInnerHTML={{ __html: s }} />
	) : (
		<p style={base} {...dataAttrs}>
			{s}
		</p>
	);
}

export function Blockquote({
	base,
	dataAttrs,
	text,
	preAuthor,
	cite,
}: BaseProps & { text?: string; preAuthor?: string; cite?: string }) {
	return (
		<blockquote style={base} {...dataAttrs}>
			{text ?? ''}
			{(preAuthor || cite) && (
				<p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
					{preAuthor}
					{cite && (
						<cite style={{ marginLeft: 8, fontStyle: 'italic' }}>{cite}</cite>
					)}
				</p>
			)}
		</blockquote>
	);
}
