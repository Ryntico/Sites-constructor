import React, { useState } from 'react';

type Props = {
	onDrop: (tplKey?: string, moveNodeId?: string) => void;
	scrollContainer?: React.RefObject<HTMLElement>;
	visible?: boolean;
	axis?: 'x' | 'y';
};

const TYPE_TPL = 'application/x-block-template';
const TYPE_MOVE = 'application/x-move-node';

export function DropZone({
	onDrop,
	scrollContainer,
	visible = false,
	axis = 'y',
}: Props) {
	const [over, setOver] = useState(false);

	if (!visible) return null;

	const accepts = (dt: DataTransfer): boolean => {
		const arr = Array.from(dt.types || []);
		const has = (k: string) => arr.includes(k);
		return has(TYPE_TPL) || has(TYPE_MOVE);
	};

	const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
		const dt = e.dataTransfer;
		if (!accepts(dt)) return;

		e.preventDefault();

		const isMove = Array.from(dt.types || []).includes(TYPE_MOVE);
		try {
			dt.dropEffect = isMove ? 'move' : 'copy';
		} catch {}

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

	const base: React.CSSProperties = {
		border: `2px dashed ${over ? '#5c7cfa' : '#e6e8ef'}`,
		borderRadius: 8,
		background: over ? 'rgba(92,124,250,0.08)' : 'transparent',
		transition: 'background .12s, border-color .12s',
		zIndex: 3,
	};

	const style =
		axis === 'x'
			? {
					...base,
					width: 12,
					minHeight: 24,
					alignSelf: 'stretch',
					margin: '0 8px',
					flex: '0 0 12px',
				}
			: {
					...base,
					height: 12,
					width: '100%',
					alignSelf: 'stretch',
					margin: '8px 0',
				};

	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			style={style}
			title="Перетащите сюда"
		/>
	);
}
