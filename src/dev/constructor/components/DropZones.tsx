import React, { useState } from 'react';

type Props = {
	onDrop: (tplKey?: string, moveNodeId?: string) => void;
	scrollContainer?: React.RefObject<HTMLElement>;
};

export function DropZone({ onDrop, scrollContainer }: Props) {
	const [over, setOver] = useState(false);

	return (
		<div
			onDragOver={(e) => {
				e.preventDefault();
				e.dataTransfer.dropEffect = 'copy';
				setOver(true);

				const el = scrollContainer?.current;
				if (el) {
					const rect = el.getBoundingClientRect();
					const m = 80;
					if (e.clientY < rect.top + m) el.scrollTop -= 12;
					else if (e.clientY > rect.bottom - m) el.scrollTop += 12;
				}
			}}
			onDragLeave={() => setOver(false)}
			onDrop={(e) => {
				e.preventDefault();
				setOver(false);
				const tplKey = e.dataTransfer.getData('application/x-block-template');
				const moveId = e.dataTransfer.getData('application/x-move-node');
				if (tplKey) onDrop(tplKey, undefined);
				else if (moveId) onDrop(undefined, moveId);
			}}
			style={{
				height: 12,
				border: `2px dashed ${over ? '#5c7cfa' : '#e6e8ef'}`,
				borderRadius: 8,
				background: over ? 'rgba(92,124,250,0.08)' : 'transparent',
				margin: '8px 0',
			}}
			title="Перетащите сюда"
		/>
	);
}
