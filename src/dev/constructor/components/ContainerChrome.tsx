import React from 'react';
import type { Axis } from '@/types/siteTypes';
import { dndContainerStyle } from '@/dev/constructor/runtime/styles/dndContainerStyle';
import { ContainerLabel } from '@/dev/constructor/components/ContainerLabel';

type Props = {
	axis: Axis;
	base: React.CSSProperties;
	isEmpty: boolean;
	dragging: boolean;
	type: string;
	children: React.ReactNode;
};

export function ContainerChrome({
	axis,
	base,
	isEmpty,
	dragging,
	type,
	children,
}: Props): React.ReactElement {
	const style = dndContainerStyle(base, axis, isEmpty, dragging);
	return (
		<div style={style}>
			<ContainerLabel type={type} base={base} />
			{children}
		</div>
	);
}
