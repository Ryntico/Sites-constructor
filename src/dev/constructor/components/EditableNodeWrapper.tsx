import React, { useState } from 'react';

type Props = {
	nodeId: string;
	parentId: string;
	index: number;
	onRemove(nodeId: string, parentId: string): void;
	onSelect?(nodeId: string): void;
	children: React.ReactNode;
	isSelected?: boolean;
};

export function EditableNodeWrapper({
	nodeId,
	parentId,
	onRemove,
	onSelect,
	children,
	isSelected = false,
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
				<button
					type="button"
					draggable={false}
					title="Удалить"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(nodeId, parentId);
					}}
					style={iconBtn}
				>
					×
				</button>

				<span
					title="Перетащите"
					draggable={false}
					onMouseDown={(e) => e.stopPropagation()}
					style={{ ...iconBtn, cursor: 'grab' }}
				>
					↕
				</span>
			</div>

			<div>{children}</div>
		</div>
	);
}

const iconBtn: React.CSSProperties = {
	fontSize: 12,
	lineHeight: '18px',
	width: 22,
	height: 22,
	borderRadius: 6,
	border: '1px solid #d0d3dc',
	background: '#fff',
	cursor: 'pointer',
};
