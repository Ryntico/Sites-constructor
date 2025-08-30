import React from 'react';
import { DropZone } from './DropZones';
import type { Axis, Side } from '@/types/siteTypes';

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
	if (axis === 'y') {
		return (
			<div style={{ display: 'flex', alignItems: 'stretch', width: '100%' }}>
				<DropZone
					onDrop={(tpl, move, o) => onDropSide('left', tpl, move, o)}
					scrollContainer={scrollContainer}
					visible={isDragging}
					axis="x"
					matchId={cid}
					copyKeyRef={copyKeyRef}
					isMac={isMac}
				/>

				<div style={centerStyle}>
					{isFirst && (
						<DropZone
							onDrop={(tpl, move, o) => onDropSide('top', tpl, move, o)}
							scrollContainer={scrollContainer}
							visible={isDragging}
							axis="y"
							matchId={cid}
							copyKeyRef={copyKeyRef}
							isMac={isMac}
						/>
					)}

					{children}

					<DropZone
						onDrop={(tpl, move, o) => onDropSide('bottom', tpl, move, o)}
						scrollContainer={scrollContainer}
						visible={isDragging}
						axis="y"
						matchId={cid}
						copyKeyRef={copyKeyRef}
						isMac={isMac}
					/>
				</div>

				<DropZone
					onDrop={(tpl, move, o) => onDropSide('right', tpl, move, o)}
					scrollContainer={scrollContainer}
					visible={isDragging}
					axis="x"
					matchId={cid}
					copyKeyRef={copyKeyRef}
					isMac={isMac}
				/>
			</div>
		);
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
			<DropZone
				onDrop={(tpl, move, o) => onDropSide('top', tpl, move, o)}
				scrollContainer={scrollContainer}
				visible={isDragging}
				axis="y"
				matchId={cid}
				copyKeyRef={copyKeyRef}
				isMac={isMac}
			/>

			<div style={{ display: 'flex', alignItems: 'stretch', minWidth: 0 }}>
				<DropZone
					onDrop={(tpl, move, o) => onDropSide('left', tpl, move, o)}
					scrollContainer={scrollContainer}
					visible={isDragging}
					axis="x"
					matchId={cid}
					copyKeyRef={copyKeyRef}
					isMac={isMac}
				/>

				<div style={centerStyle}>{children}</div>

				<DropZone
					onDrop={(tpl, move, o) => onDropSide('right', tpl, move, o)}
					scrollContainer={scrollContainer}
					visible={isDragging}
					axis="x"
					matchId={cid}
					copyKeyRef={copyKeyRef}
					isMac={isMac}
				/>
			</div>

			<DropZone
				onDrop={(tpl, move, o) => onDropSide('bottom', tpl, move, o)}
				scrollContainer={scrollContainer}
				visible={isDragging}
				axis="y"
				matchId={cid}
				copyKeyRef={copyKeyRef}
				isMac={isMac}
			/>
		</div>
	);
}
