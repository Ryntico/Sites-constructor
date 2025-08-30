import { type CSSProperties } from 'react';
import type { Axis } from '@/types/siteTypes.ts';

export function dndContainerStyle(
	base: CSSProperties,
	axis: Axis,
	empty: boolean,
	dragging: boolean,
): CSSProperties {
	const disp = base.display;
	const wantDisplay: CSSProperties['display'] =
		disp === 'flex' || disp === 'inline-flex' ? disp : 'flex';

	const wantDirection: CSSProperties['flexDirection'] =
		base.flexDirection ?? (axis === 'y' ? 'column' : undefined);

	return {
		...base,
		display: wantDisplay,
		flexDirection: wantDirection,
		minHeight: empty ? 56 : base.minHeight,
		padding: empty && base.padding == null ? 8 : base.padding,
		borderRadius: empty && base.borderRadius == null ? 8 : base.borderRadius,
		border: dragging && empty ? '2px dashed #e6e8ef' : base.border,
		background: dragging && empty ? 'rgba(92,124,250,0.03)' : base.background,
	};
}
