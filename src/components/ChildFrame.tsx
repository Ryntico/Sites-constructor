import React from 'react';
import { DropZone } from './DropZones.tsx';
import type { Axis, Side } from '@/types/siteTypes.ts';

export type ChildFrameProps = {
	axis: Axis;
	cid: string;
	isFirst: boolean;
	isDragging: boolean;
	scrollContainer?: React.RefObject<HTMLElement>;
	onDropSide: (
		side: Side,
		tpl?: string,
		move?: string,
		opts?: { copy?: boolean },
	) => void;
	copyKeyRef: React.RefObject<boolean>;
	isMac: boolean;
	centerStyle: React.CSSProperties;
	children: React.ReactNode;
};

const SIDE_AXIS: Record<Side, Axis> = {
	left: 'x',
	right: 'x',
	top: 'y',
	bottom: 'y',
};

export function ChildFrame({
	axis,
	cid,
	isFirst,
	isDragging,
	scrollContainer,
	onDropSide,
	copyKeyRef,
	isMac,
	centerStyle,
	children,
}: ChildFrameProps): React.ReactElement {
	const DZ = (side: Side) => (
		<DropZone
			key={`${cid}-${side}`}
			onDrop={(tpl, move, o) => onDropSide(side, tpl, move, o)}
			scrollContainer={scrollContainer}
			visible={isDragging}
			axis={SIDE_AXIS[side]}
			matchId={cid}
			copyKeyRef={copyKeyRef}
			isMac={isMac}
		/>
	);

	if (axis === 'y') {
		return (
			<div style={{ display: 'flex', alignItems: 'stretch', width: '100%' }}>
				{DZ('left')}

				<div style={centerStyle}>
					{isFirst && DZ('top')}
					{children}
					{DZ('bottom')}
				</div>

				{DZ('right')}
			</div>
		);
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
			{DZ('top')}

			<div style={{ display: 'flex', alignItems: 'stretch', minWidth: 0 }}>
				{DZ('left')}
				<div style={centerStyle}>{children}</div>
				{DZ('right')}
			</div>

			{DZ('bottom')}
		</div>
	);
}
