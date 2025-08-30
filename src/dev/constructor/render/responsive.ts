import type { ThemeTokens, StyleShortcuts } from '@/types/siteTypes.ts';

const isToken = (v: unknown): v is string =>
	typeof v === 'string' && v.startsWith('token:');

export function resolveToken(theme: ThemeTokens, token: string): any {
	const path = token.replace(/^token:/, '').split('.');
	let cur: any = theme;
	for (const key of path) {
		if (cur == null) break;
		cur = cur[key];
	}
	return cur;
}

function pxIfNumber(v: any): any {
	if (typeof v === 'number') return `${v}px`;
	return v;
}

function mapAlign(v?: 'start' | 'center' | 'end'): string | undefined {
	if (!v) return undefined;
	return v === 'start' ? 'flex-start' : v === 'end' ? 'flex-end' : 'center';
}

export function styleFromShortcuts(
	theme: ThemeTokens,
	s?: StyleShortcuts,
): React.CSSProperties {
	if (!s) return {};
	const pick = (v: any) => (isToken(v) ? resolveToken(theme, v) : v);

	const css: React.CSSProperties = {};

	const padd = (k: keyof StyleShortcuts, cssKey: keyof React.CSSProperties) => {
		const v = s[k];
		if (v == null) return;
		css[cssKey] = pxIfNumber(pick(v));
	};
	const marg = (k: keyof StyleShortcuts, cssKey: keyof React.CSSProperties) => {
		const v = s[k];
		if (v == null) return;
		css[cssKey] = v === 'auto' ? 'auto' : pxIfNumber(pick(v));
	};

	if (s.display) css.display = s.display;
	if (s.gap != null) css.gap = pxIfNumber(pick(s.gap));
	if (s.columns && s.display === 'grid')
		css.gridTemplateColumns = `repeat(${s.columns}, 1fr)`;
	if (s.columns && s.display === 'flex') css.gridTemplateColumns = undefined;

	if (s.w != null) css.width = pxIfNumber(pick(s.w));
	if (s.h != null) css.height = pxIfNumber(pick(s.h));
	if (s.maxW != null) css.maxWidth = pxIfNumber(pick(s.maxW));
	if (s.maxH != null) css.maxHeight = pxIfNumber(pick(s.maxH));

	padd('p', 'padding');
	padd('px', 'paddingLeft');
	padd('px', 'paddingRight');
	padd('py', 'paddingTop');
	padd('py', 'paddingBottom');
	padd('pt', 'paddingTop');
	padd('pr', 'paddingRight');
	padd('pb', 'paddingBottom');
	padd('pl', 'paddingLeft');

	marg('m', 'margin');
	marg('mx', 'marginLeft');
	marg('mx', 'marginRight');
	marg('my', 'marginTop');
	marg('my', 'marginBottom');
	marg('mt', 'marginTop');
	marg('mr', 'marginRight');
	marg('mb', 'marginBottom');
	marg('ml', 'marginLeft');

	if (s.bg) css.background = pick(s.bg);
	if (s.color) css.color = pick(s.color);
	if (s.borderColor) css.borderColor = pick(s.borderColor);
	if (s.borderLeft) {
		css.borderLeft = pick(s.borderLeft);
	}
	if (s.borderLeftWidth) css.borderLeftWidth = pxIfNumber(pick(s.borderLeftWidth));

	if (s.radius) css.borderRadius = pxIfNumber(pick(s.radius));
	if (s.shadow) css.boxShadow = pick(s.shadow);
	if (s.textAlign) css.textAlign = s.textAlign as 'left' | 'center' | 'right';

	if (s.items) {
		if (s.items === 'stretch' || s.items === 'baseline') css.alignItems = s.items;
		else css.alignItems = mapAlign(s.items as 'start' | 'center' | 'end');
	}

	if (s.justify) {
		if (s.justify === 'between') {
			css.justifyContent = 'space-between';
		} else if (s.justify === 'around') {
			css.justifyContent = 'space-around';
		} else if (s.justify === 'evenly') {
			css.justifyContent = 'space-evenly';
		} else {
			css.justifyContent = mapAlign(s.justify as 'start' | 'center' | 'end');
		}
	}

	if (s.flexDirection)
		css.flexDirection = s.flexDirection as
			| 'row'
			| 'row-reverse'
			| 'column'
			| 'column-reverse';

	if (s.wrap) css.flexWrap = s.wrap as 'nowrap' | 'wrap' | 'wrap-reverse';

	if (s.alignSelf) {
		if (s.alignSelf === 'start') {
			css.alignSelf = 'flex-start';
		} else if (s.alignSelf === 'end') {
			css.alignSelf = 'flex-end';
		} else {
			css.alignSelf = s.alignSelf;
		}
	}

	if (s.order !== undefined) {
		css.order = s.order;
	}

	if (s.flexGrow !== undefined) {
		css.flexGrow = s.flexGrow;
	}

	if (s.flexShrink !== undefined) {
		css.flexShrink = s.flexShrink;
	}

	return css;
}

export function mergeResponsive(
	theme: ThemeTokens,
	props?: {
		style?: {
			base?: StyleShortcuts;
			sm?: StyleShortcuts;
			md?: StyleShortcuts;
			lg?: StyleShortcuts;
		};
	},
): { base: React.CSSProperties; mediaCssText: string } {
	const base = styleFromShortcuts(theme, props?.style?.base);
	const mk = (sc?: StyleShortcuts) =>
		sc ? styleObjToCss(styleFromShortcuts(theme, sc)) : '';
	const sm = mk(props?.style?.sm);
	const md = mk(props?.style?.md);
	const lg = mk(props?.style?.lg);

	let mediaCssText = '';
	if (sm)
		mediaCssText += `@media (max-width:${theme.breakpoints.sm}px){[data-res-id]{${sm}}}`;
	if (md)
		mediaCssText += `@media (max-width:${theme.breakpoints.md}px){[data-res-id]{${md}}}`;
	if (lg)
		mediaCssText += `@media (max-width:${theme.breakpoints.lg}px){[data-res-id]{${lg}}}`;
	return { base, mediaCssText };
}

export function styleObjToCss(style: React.CSSProperties): string {
	return Object.entries(style)
		.filter(([, v]) => v != null && v !== '')
		.map(([k, v]) => `${camelToKebab(k)}:${v};`)
		.join('');
}

function camelToKebab(s: string) {
	return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
