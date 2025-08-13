import React from 'react';

type Props = {
	nodeId: string;
	parentId: string;
	index: number;
	onRemove(nodeId: string, parentId: string): void;
	onSelect?(nodeId: string): void;
	children: React.ReactNode;
	draggable?: boolean;
};

export function EditableNodeWrapper({
	nodeId,
	parentId,
	onRemove,
	onSelect,
	draggable = true,
	children,
}: Props) {
	return (
		<div
			data-node-id={nodeId}
			style={{ position: 'relative' }}
			onClick={(e) => {
				e.stopPropagation();
				onSelect?.(nodeId);
			}}
			draggable={draggable}
			onDragStart={(e) => {
				if (!draggable) return;
				e.stopPropagation();
				e.dataTransfer.setData('application/x-move-node', nodeId);
				e.dataTransfer.effectAllowed = 'move';
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 6,
					right: 6,
					display: 'flex',
					gap: 6,
					opacity: 0,
					transition: 'opacity .15s',
					zIndex: 2,
				}}
				className="node-controls"
			>
				<button
					title="Удалить"
					onClick={(e) => {
						e.stopPropagation();
						onRemove(nodeId, parentId);
					}}
					style={iconBtn}
				>
					×
				</button>
				<span title="Перетащите" style={{ ...iconBtn, cursor: 'grab' }}>
					↕
				</span>
			</div>

			<div
				onMouseEnter={(e) => {
					const el =
						(e.currentTarget.parentElement?.querySelector(
							'.node-controls',
						) as HTMLElement) || null;
					if (el) el.style.opacity = '1';
				}}
				onMouseLeave={(e) => {
					const el =
						(e.currentTarget.parentElement?.querySelector(
							'.node-controls',
						) as HTMLElement) || null;
					if (el) el.style.opacity = '0';
				}}
			>
				{children}
			</div>
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
