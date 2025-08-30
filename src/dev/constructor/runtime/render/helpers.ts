import type { CSSProperties } from 'react';
import type { Axis, PageSchema } from '@/types/siteTypes';
import { TYPE_MOVE, TYPE_TPL } from '../dnd/constants';
import { typesToArray } from '../dnd/utils';
import { isContainer } from '../schemaOps';

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

export function acceptsDt(dtOrTypes: DataTransfer | DataTransfer['types']): boolean {
	const types = 'types' in dtOrTypes ? dtOrTypes.types : dtOrTypes;
	const arr = typesToArray(types);
	return arr.includes(TYPE_TPL) || arr.includes(TYPE_MOVE);
}
