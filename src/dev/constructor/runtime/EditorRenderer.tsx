import React from 'react';
import type { PageSchema, NodeJson, ThemeTokens, NodeSubtree } from './types';
import { mergeResponsive } from './style';
import {
	isContainer,
	getChildren,
	insertSubtree,
	moveNode,
	removeNode,
} from './schemaOps';
import { DropZone } from '../components/DropZones';
import { EditableNodeWrapper } from '../components/EditableNodeWrapper';

const TYPE_MOVE = 'application/x-move-node';

export type EditorRendererProps = {
	schema: PageSchema;
	theme: ThemeTokens;
	onSchemaChange(next: PageSchema): void;
	resolveTemplate(key: string): NodeSubtree | null;
	onSelectNode?(id: string | null): void;
	scrollContainer?: React.RefObject<HTMLElement>;
};

export function EditorRenderer({
	schema,
	theme,
	onSchemaChange,
	resolveTemplate,
	onSelectNode,
	scrollContainer,
}: EditorRendererProps) {
	const handleDropTemplate = (parentId: string, index: number, tplKey: string) => {
		const sub = resolveTemplate(tplKey);
		if (!sub) return;
		insertSubtree(schema, sub, parentId, index);
		onSchemaChange({ ...schema });
	};

	const handleDropMove = (parentId: string, index: number, nodeId: string) => {
		moveNode(schema, nodeId, parentId, index);
		onSchemaChange({ ...schema });
	};

	const handleDelete = (nodeId: string) => {
		removeNode(schema, nodeId);
		onSchemaChange({ ...schema });
		onSelectNode?.(null);
	};

	return (
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
		/>
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

	return (
		<EditableNodeWrapper
			nodeId={id}
			parentId={schema.rootId === id ? id : (findParent(schema, id) ?? id)}
			index={0}
			onRemove={(nid, _pid) => onDelete(nid)}
			onSelect={(nid) => onSelect?.(nid)}
			draggable={!isRoot}
		>
			<div
				data-res-id={id}
				draggable={false}
				onDragStart={(e) => {
					if (isRoot) return;
					e.dataTransfer.setData(TYPE_MOVE, id);
					e.dataTransfer.effectAllowed = 'move';
				}}
				style={{
					position: 'relative',
					...(node.type === 'section' ? { width: '100%' } : {}),
					...baseStyle,
				}}
			>
				{scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}

				{renderPrimitive(node)}

				{isParent && (
					<div>
						<DropZone
							onDrop={(tpl, moveId) => {
								if (tpl) onDropTemplate(id, 0, tpl);
								if (moveId) onDropMove(id, 0, moveId);
							}}
							scrollContainer={scrollContainer}
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
								/>
								<DropZone
									onDrop={(tpl, moveId) => {
										if (tpl) onDropTemplate(id, idx + 1, tpl);
										if (moveId) onDropMove(id, idx + 1, moveId);
									}}
									scrollContainer={scrollContainer}
								/>
							</React.Fragment>
						))}
					</div>
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
			const H = `h${node.props?.level ?? 2}` as any;
			return <H>{node.props?.text ?? 'Heading'}</H>;
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
				textDecoration: 'none',
				display: 'inline-block',
				cursor: 'pointer',
			};
			return isLink ? (
				<a href={node.props?.href} style={common}>
					{label}
				</a>
			) : (
				<button style={common}>{label}</button>
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
