import type { CSSProperties } from 'react';
import type { Axis, PageSchema } from '@/types/siteTypes.ts';
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
