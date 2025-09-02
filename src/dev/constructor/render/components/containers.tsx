import React from 'react';
import type { ThemeTokens } from '@/types/siteTypes.ts';

type BaseProps = {
	base: React.CSSProperties;
	dataAttrs: { 'data-res-id': string };
	children?: React.ReactNode;
};

export function Page({
	base,
	theme,
	mediaCssText,
	dataAttrs,
	children,
}: BaseProps & { theme: ThemeTokens; mediaCssText?: string }) {
	return (
		<div
			style={{ ...base, minHeight: '100vh', background: theme.colors.page }}
			{...dataAttrs}
		>
			{children}
			{mediaCssText ? (
				<style dangerouslySetInnerHTML={{ __html: mediaCssText }} />
			) : null}
		</div>
	);
}

export function Container({
	as = 'div',
	base,
	dataAttrs,
	children,
}: BaseProps & { as?: 'div' | 'section' }) {
	const Tag = as;
	return (
		<Tag style={base} {...dataAttrs}>
			{children}
		</Tag>
	);
}
