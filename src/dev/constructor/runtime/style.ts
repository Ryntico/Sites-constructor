import type { ThemeTokens, StyleShortcuts } from './types';

const isToken = (v: unknown): v is string =>
	typeof v === 'string' && v.startsWith('token:');

export function resolveToken(theme: ThemeTokens, token: string): any {
	const path = token.replace(/^token:/, '').split('.');
	let cur: any = theme as any;
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
		(css as any)[cssKey] = pxIfNumber(pick(v));
	};
	const marg = (k: keyof StyleShortcuts, cssKey: keyof React.CSSProperties) => {
		const v = s[k];
		if (v == null) return;
		(css as any)[cssKey] = v === 'auto' ? 'auto' : pxIfNumber(pick(v));
	};

	if (s.display) css.display = s.display;
	if (s.gap != null) (css as any).gap = pxIfNumber(pick(s.gap));
	if (s.columns && s.display === 'grid')
		(css as any).gridTemplateColumns = `repeat(${s.columns}, 1fr)`;
	if (s.columns && s.display === 'flex') (css as any).gridTemplateColumns = undefined;

	if (s.w != null) css.width = pxIfNumber(pick(s.w));
	if (s.h != null) css.height = pxIfNumber(pick(s.h));
	if (s.maxW != null) (css as any).maxWidth = pxIfNumber(pick(s.maxW));

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

	if (s.bg) (css as any).background = pick(s.bg);
	if (s.color) css.color = pick(s.color);
	if (s.borderColor) (css as any).borderColor = pick(s.borderColor);

	if (s.radius != null) (css as any).borderRadius = pxIfNumber(pick(s.radius));
	if (s.shadow) (css as any).boxShadow = pick(s.shadow);
	if (s.textAlign) css.textAlign = s.textAlign;

	if (s.items) (css as any).alignItems = mapAlign(s.items);
	if (s.justify)
		(css as any).justifyContent =
			s.justify === 'between' ? 'space-between' : mapAlign(s.justify);
	if (s.flexDirection) css.flexDirection = s.flexDirection;

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
