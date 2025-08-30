import React from 'react';
import { DropZone } from './DropZones';
import type { Axis, Side } from '@/types/siteTypes';

type Props = {
	axis: Axis;
	matchId: string;
	visible: boolean;
	scrollContainer?: React.RefObject<HTMLElement>;
	onDrop: (
		side: Side,
		tplKey?: string,
		moveId?: string,
		opts?: { copy?: boolean },
	) => void;
	copyKeyRef?: React.RefObject<boolean>;
	isMac?: boolean;

	showLeft?: boolean;
	showRight?: boolean;
	showTop?: boolean;
	showBottom?: boolean;
};

export function SideDropzones({
	matchId,
	visible,
	scrollContainer,
	onDrop,
	copyKeyRef,
	isMac,
	showLeft,
	showRight,
	showTop,
	showBottom,
}: Props) {
	return (
		<div style={{ display: 'contents' }}>
			{showTop && (
				<DropZone
					onDrop={(tpl, move, o) => onDrop('top', tpl, move, o)}
					scrollContainer={scrollContainer}
					visible={visible}
					axis="y"
					matchId={matchId}
					copyKeyRef={copyKeyRef}
					isMac={isMac}
				/>
			)}
			{showBottom && (
				<DropZone
					onDrop={(tpl, move, o) => onDrop('bottom', tpl, move, o)}
					scrollContainer={scrollContainer}
					visible={visible}
					axis="y"
					matchId={matchId}
					copyKeyRef={copyKeyRef}
					isMac={isMac}
				/>
			)}
			{showLeft && (
				<DropZone
					onDrop={(tpl, move, o) => onDrop('left', tpl, move, o)}
					scrollContainer={scrollContainer}
					visible={visible}
					axis="x"
					matchId={matchId}
					copyKeyRef={copyKeyRef}
					isMac={isMac}
				/>
			)}
			{showRight && (
				<DropZone
					onDrop={(tpl, move, o) => onDrop('right', tpl, move, o)}
					scrollContainer={scrollContainer}
					visible={visible}
					axis="x"
					matchId={matchId}
					copyKeyRef={copyKeyRef}
					isMac={isMac}
				/>
			)}
		</div>
	);
}
