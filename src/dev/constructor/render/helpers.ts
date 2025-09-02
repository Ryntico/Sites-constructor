import type { CSSProperties } from 'react';
import type { Action, Axis, PageSchema } from '@/types/siteTypes.ts';
import { isContainer } from '../ops/schemaOps.ts';

export function computeAxis(base: CSSProperties, nodeType: string): Axis {
	const disp = base?.display as CSSProperties['display'] | undefined;
	const fd = base?.flexDirection as CSSProperties['flexDirection'] | undefined;
	if (disp === 'flex' || disp === 'inline-flex') {
		return fd && String(fd).startsWith('column') ? 'y' : 'x';
	}
	return nodeType === 'row' ? 'x' : 'y';
}

export function isFillLike(schema: PageSchema, childId: string): boolean {
	const n = schema.nodes[childId];
	if (!n) return false;
	return (
		n.type === 'heading' ||
		n.type === 'paragraph' ||
		n.type === 'list' ||
		n.type === 'listItem' ||
		isContainer(n) ||
		n.type === 'divider'
	);
}

export function buildContainerWrapStyle(
	base: CSSProperties,
	editorPad = 14,
): CSSProperties {
	return {
		...base,
		paddingTop: base.paddingTop ?? editorPad,
		paddingLeft: base.paddingLeft ?? editorPad,
		paddingRight: base.paddingRight ?? 6,
	};
}

export function buildWrapperStyle(
	base: CSSProperties,
	opts: { parentLike: boolean; nodeType: string; editorPad?: number },
): CSSProperties {
	const { parentLike, nodeType, editorPad = 14 } = opts;

	if (parentLike) {
		return {
			position: 'relative',
			userSelect: 'none',
			...(nodeType === 'section' ? { width: '100%' } : {}),
			...buildContainerWrapStyle(base, editorPad),
		};
	}

	if (nodeType === 'divider') {
		return {
			position: 'relative',
			userSelect: 'none',
			display: 'block',
			width: '100%',
			...base,
		};
	}

	return {
		position: 'relative',
		userSelect: 'none',
		display: 'inline-flex',
		flex: '0 0 auto',
		minWidth: 0,
		verticalAlign: 'top',
	};
}

export function buildCenterStyle(axis: Axis, isFill: boolean): CSSProperties {
	if (axis === 'y') {
		return {
			display: 'flex',
			flexDirection: 'column',
			...(isFill
				? { flex: '1 1 auto', minWidth: 0, maxWidth: '100%' }
				: { display: 'inline-flex', flex: '0 0 auto', minWidth: 0 }),
		};
	}
	return isFill
		? { flex: '1 1 auto', minWidth: 0, maxWidth: '100%' }
		: { flex: '0 0 auto', minWidth: 0, display: 'inline-flex' };
}

export type DataResAttr = { 'data-res-id': string };

export const dataResAttr = (id: string): DataResAttr => ({ 'data-res-id': id });

export function serializeActionsAttr(on?: Record<string, Action[]>): string | undefined {
	const list = on?.click;
	if (!list?.length) return undefined;
	try {
		return JSON.stringify(list);
	} catch {
		return undefined;
	}
}

export const isHtml = (s: string): boolean => /<[a-z][\s\S]*>/i.test(s);

export const clampHeading = (n: unknown): 1 | 2 | 3 | 4 | 5 | 6 => {
	const x = Number(n);
	const lvl = Number.isFinite(x) ? Math.min(Math.max(x, 1), 6) : 1;
	return lvl as 1 | 2 | 3 | 4 | 5 | 6;
};

export type InputMode = React.HTMLAttributes<HTMLElement>['inputMode'];
const INPUT_MODES = new Set<InputMode>([
	'text',
	'none',
	'tel',
	'url',
	'email',
	'numeric',
	'decimal',
	'search',
]);
export function asInputMode(v?: string): InputMode | undefined {
	if (!v) return undefined;
	return INPUT_MODES.has(v as InputMode) ? (v as InputMode) : undefined;
}

export type Wrap = 'soft' | 'hard';
export function asWrap(v?: string): Wrap | undefined {
	if (v === 'soft' || v === 'hard') return v;
	return undefined;
}
