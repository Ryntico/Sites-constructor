import React, { useState } from 'react';

type Props = {
	onDrop: (tplKey?: string, moveNodeId?: string) => void;
	scrollContainer?: React.RefObject<HTMLElement>;
};

const TYPE_TPL = 'application/x-block-template';
const TYPE_MOVE = 'application/x-move-node';

export function DropZone({ onDrop, scrollContainer }: Props) {
	const [over, setOver] = useState(false);

	const accepts = (dt: DataTransfer): boolean => {
		const t = dt.types as unknown as string[];
		const has = (k: string) =>
			(Array.isArray(t) && t.includes(k)) ||
			(typeof (dt.types as any).contains === 'function' &&
				(dt.types as any).contains(k));
		return has(TYPE_TPL) || has(TYPE_MOVE);
	};

	const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
		const dt = e.dataTransfer;
		if (!accepts(dt)) return;

		e.preventDefault();

		const isMove =
			dt.types.includes?.(TYPE_MOVE) || (dt.types as any).contains?.(TYPE_MOVE);
		dt.dropEffect = isMove ? 'move' : 'copy';

		setOver(true);

		const el = scrollContainer?.current;
		if (el) {
			const rect = el.getBoundingClientRect();
			const m = 80;
			if (e.clientY < rect.top + m) el.scrollTop -= 12;
			else if (e.clientY > rect.bottom - m) el.scrollTop += 12;
		}
	};

	const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
		if (e.currentTarget.contains(e.relatedTarget as Node)) return;
		setOver(false);
	};

	const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
		e.preventDefault();
		setOver(false);

		const dt = e.dataTransfer;
		const tplKey = dt.getData(TYPE_TPL);
		const moveId = dt.getData(TYPE_MOVE);

		if (tplKey) onDrop(tplKey, undefined);
		else if (moveId) onDrop(undefined, moveId);
	};

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
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
