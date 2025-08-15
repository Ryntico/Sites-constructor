import React, { useRef, useState } from 'react';
import type { PageSchema, NodeJson, ThemeTokens, NodeSubtree } from './types';
import { mergeResponsive } from './style';
import {
	isContainer,
	getChildren,
	insertSubtree,
	moveNode,
	removeNode,
	type SchemaPatch,
} from './schemaOps';
import { DropZone } from '../components/DropZones';
import { EditableNodeWrapper } from '../components/EditableNodeWrapper';

const TYPE_MOVE = 'application/x-move-node';
const TYPE_TPL = 'application/x-block-template';

export type EditorRendererProps = {
	schema: PageSchema;
	theme: ThemeTokens;
	onSchemaChange(next: PageSchema, patch?: SchemaPatch): void;
	resolveTemplate(key: string): NodeSubtree | null;
	onSelectNode?(id: string | null): void;
	scrollContainer?: React.RefObject<HTMLElement>;
	selectedId?: string | null;
};

export function EditorRenderer({
	schema,
	theme,
	onSchemaChange,
	resolveTemplate,
	onSelectNode,
	scrollContainer,
	selectedId = null,
}: EditorRendererProps) {
	const [isDragging, setIsDragging] = useState(false);
	const dragInside = useRef(0);

	const accepts = (types: DOMStringList | string[]) => {
		const arr = Array.from(types || []);
		return arr.includes(TYPE_MOVE) || arr.includes(TYPE_TPL);
	};

	const onRootDragEnter: React.DragEventHandler<HTMLDivElement> = (e) => {
		if (!accepts(e.dataTransfer.types)) return;
		dragInside.current += 1;
		if (!isDragging) setIsDragging(true);
	};

	const onRootDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
		if (!accepts(e.dataTransfer.types)) return;
		if (!isDragging) setIsDragging(true);
	};

	const onRootDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
		if (e.currentTarget.contains(e.relatedTarget as Node)) return;
		dragInside.current = 0;
		setIsDragging(false);
	};

	const onRootDrop: React.DragEventHandler<HTMLDivElement> = () => {
		dragInside.current = 0;
		setIsDragging(false);
	};

	const handleDropTemplate = (parentId: string, index: number, tplKey: string) => {
		const sub = resolveTemplate(tplKey);
		if (!sub) return;
		const { next, patch } = insertSubtree(schema, sub, parentId, index);
		onSchemaChange(next, patch);
	};

	const handleDropMove = (parentId: string, index: number, nodeId: string) => {
		const { next, patch } = moveNode(schema, nodeId, parentId, index);
		onSchemaChange(next, patch);
	};

	const handleDelete = (nodeId: string) => {
		const { next, patch } = removeNode(schema, nodeId);
		onSchemaChange(next, patch);
		onSelectNode?.(null);
	};

	return (
		<div
			data-editor-root
			onDragEnter={onRootDragEnter}
			onDragOver={onRootDragOver}
			onDragLeave={onRootDragLeave}
			onDrop={onRootDrop}
		>
			<NodeView
				id={schema.rootId}
				schema={schema}
				theme={theme}
				onDropTemplate={handleDropTemplate}
				onDropMove={handleDropMove}
				onDelete={handleDelete}
				onSelect={onSelectNode}
				scrollContainer={scrollContainer}
				isRoot
				isDragging={isDragging}
				selectedId={selectedId}
			/>
		</div>
	);
}

function NodeView(props: {
	id: string;
	schema: PageSchema;
	theme: ThemeTokens;
	onDropTemplate: (parentId: string, index: number, tplKey: string) => void;
	onDropMove: (parentId: string, index: number, nodeId: string) => void;
	onDelete: (nodeId: string) => void;
	onSelect?: (id: string) => void;
	scrollContainer?: React.RefObject<HTMLElement>;
	isRoot?: boolean;
	isDragging: boolean;
	selectedId: string | null;
}) {
	const {
		id,
		schema,
		theme,
		onDropTemplate,
		onDropMove,
		onDelete,
		onSelect,
		isRoot,
		scrollContainer,
		isDragging,
		selectedId,
	} = props;

	const node = schema.nodes[id];
	if (!node) return null;

	const isParent = isContainer(node);
	const children = getChildren(schema, id);

	const { base: baseStyle, mediaCssText } = mergeResponsive(theme, {
		style: node.props?.style,
	});
	const scopedCss = mediaCssText
		? mediaCssText.replaceAll('[data-res-id]', `[data-res-id="${id}"]`)
		: '';

	const axis: 'x' | 'y' = (() => {
		const disp = (baseStyle as any)?.display;
		const fd = (baseStyle as any)?.flexDirection as string | undefined;
		if (disp === 'flex') return fd && fd.startsWith('column') ? 'y' : 'x';
		return node.type === 'row' ? 'x' : 'y';
	})();

	const baseDisplay = (baseStyle as any)?.display;
	const fixedBaseStyle =
		node.type === 'button' && !baseDisplay
			? { display: 'inline-block', ...baseStyle }
			: baseStyle;

	return (
		<EditableNodeWrapper
			nodeId={id}
			parentId={schema.rootId === id ? id : (findParent(schema, id) ?? id)}
			index={0}
			onRemove={(nid) => onDelete(nid)}
			onSelect={(nid) => onSelect?.(nid)}
			isSelected={selectedId === id}
		>
			<div
				data-res-id={id}
				draggable={!isRoot}
				onDragStart={(e) => {
					if (isRoot) return;
					e.stopPropagation();
					e.dataTransfer.setData(TYPE_MOVE, id);
					e.dataTransfer.effectAllowed = 'move';
				}}
				style={{
					position: 'relative',
					...(node.type === 'section' ? { width: '100%' } : {}),
					...fixedBaseStyle,
					userSelect: 'none',
				}}
			>
				{scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}

				{isParent ? (
					<div
						style={{
							display:
								axis === 'x'
									? (baseStyle as any)?.display || 'flex'
									: (baseStyle as any)?.display,
						}}
					>
						<DropZone
							onDrop={(tpl, moveId) => {
								if (tpl) onDropTemplate(id, 0, tpl);
								if (moveId) onDropMove(id, 0, moveId);
							}}
							scrollContainer={scrollContainer}
							visible={isDragging}
							axis={axis}
						/>

						{children.map((cid, idx) => (
							<React.Fragment key={cid}>
								<NodeView
									id={cid}
									schema={schema}
									theme={theme}
									onDropTemplate={onDropTemplate}
									onDropMove={onDropMove}
									onDelete={onDelete}
									onSelect={onSelect}
									scrollContainer={scrollContainer}
									isDragging={isDragging}
									selectedId={selectedId}
								/>
								<DropZone
									onDrop={(tpl, moveId) => {
										if (tpl) onDropTemplate(id, idx + 1, tpl);
										if (moveId) onDropMove(id, idx + 1, moveId);
									}}
									scrollContainer={scrollContainer}
									visible={isDragging}
									axis={axis}
								/>
							</React.Fragment>
						))}
					</div>
				) : (
					renderPrimitive(node)
				)}
			</div>
		</EditableNodeWrapper>
	);
}

function findParent(schema: PageSchema, childId: string): string | null {
	for (const [pid, n] of Object.entries(schema.nodes)) {
		if (n.childrenOrder?.includes(childId)) return pid;
	}
	return null;
}

function renderPrimitive(node: NodeJson) {
	switch (node.type) {
		case 'page':
		case 'section':
		case 'box':
		case 'row':
			return <div />;

		case 'heading': {
			const level = (node.props?.level ?? 2) as 1 | 2 | 3 | 4 | 5 | 6;
			const tag = `h${level}` as keyof JSX.IntrinsicElements;
			return React.createElement(tag, undefined, node.props?.text ?? 'Heading');
		}

		case 'paragraph':
			return <p>{node.props?.text ?? 'Text'}</p>;

		case 'image':
			return (
				<img
					src={node.props?.src}
					alt={node.props?.alt ?? ''}
					style={{ maxWidth: '100%' }}
				/>
			);

		case 'button': {
			const isLink = !!node.props?.href;
			const label = node.props?.text ?? 'Button';
			const common: React.CSSProperties = {
				display: 'inline-block',
				cursor: 'pointer',
				border: 'none',
				outline: 'none',
				background: 'transparent',
				color: 'inherit',
				padding: 0,
				margin: 0,
				font: 'inherit',
				lineHeight: 'inherit',
				width: 'auto',
				textDecoration: 'none',
				WebkitAppearance: 'none' as any,
				MozAppearance: 'none' as any,
				appearance: 'none' as any,
			};
			return isLink ? (
				<a href={node.props?.href} style={common}>
					{label}
				</a>
			) : (
				<button type="button" style={common}>
					{label}
				</button>
			);
		}

		case 'divider':
			return <hr />;

		case 'list':
			return <ul />;

		case 'listItem':
			return <li>{node.props?.text ?? ''}</li>;

		default:
			return null;
	}
}
