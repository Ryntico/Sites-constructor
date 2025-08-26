import React, { useState } from 'react';

type Props = {
	nodeId: string;
	parentId: string;
	index: number;
	onRemove(nodeId: string, parentId: string): void;
	onSelect?(nodeId: string): void;
	children: React.ReactNode;
	isSelected?: boolean;
	canRemove?: boolean;
};

export function EditableNodeWrapper({
	nodeId,
	parentId,
	onRemove,
	onSelect,
	children,
	isSelected = false,
	canRemove,
}: Props) {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			data-node-id={nodeId}
			style={{
				position: 'relative',
				borderRadius: 10,
				boxShadow: isSelected ? '0 0 0 1px rgba(92,124,250,.35)' : 'none',
				transition: 'box-shadow .12s',
			}}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			onClick={(e) => {
				e.stopPropagation();
				onSelect?.(nodeId);
			}}
		>
			<div
				className="node-controls"
				style={{
					position: 'absolute',
					top: 6,
					right: 6,
					display: 'flex',
					gap: 6,
					opacity: hovered ? 1 : 0,
					pointerEvents: hovered ? 'auto' : 'none',
					transition: 'opacity .15s',
					zIndex: 5,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<span
					data-drag-handle
					draggable
					title="Перетащить"
					style={handleBtn}
					onDragStart={(e) => {
						e.stopPropagation();
						try {
							e.dataTransfer.setData('application/x-move-node', nodeId);
							e.dataTransfer.effectAllowed = 'move';
						} catch {}
					}}
				>
					<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
						<circle cx="4" cy="3" r="1.2" fill="#667085" />
						<circle cx="4" cy="7" r="1.2" fill="#667085" />
						<circle cx="4" cy="11" r="1.2" fill="#667085" />
						<circle cx="9.5" cy="3" r="1.2" fill="#667085" />
						<circle cx="9.5" cy="7" r="1.2" fill="#667085" />
						<circle cx="9.5" cy="11" r="1.2" fill="#667085" />
					</svg>
				</span>

				<button
					type="button"
					draggable={false}
					disabled={!canRemove}
					title="Удалить"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(nodeId, parentId);
					}}
					style={iconBtn}
				>
					×
				</button>
			</div>

			<div>{children}</div>
		</div>
	);
}

const iconBtn: React.CSSProperties = {
	width: 18,
	height: 18,
	borderRadius: 6,
	border: '1px solid #d0d3dc',
	background: '#fff',
	color: '#111827',
	fontSize: 10,
	lineHeight: '16px',
	textAlign: 'center',
	cursor: 'pointer',
};

const handleBtn: React.CSSProperties = {
	width: 18,
	height: 18,
	borderRadius: 6,
	border: '1px solid #d0d3dc',
	background: '#fff',
	display: 'inline-flex',
	alignItems: 'center',
	justifyContent: 'center',
	cursor: 'grab',
};
