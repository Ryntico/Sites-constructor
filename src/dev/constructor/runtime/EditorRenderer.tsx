import React, { useEffect, useRef, useState } from 'react';
import type {
	PageSchema,
	NodeJson,
	ThemeTokens,
	NodeSubtree,
	SchemaPatch,
	Side,
	Axis,
} from '@/types/siteTypes';
import { mergeResponsive } from './style';
import {
	isContainer,
	getChildren,
	insertSubtree,
	moveNode,
	removeNode,
	cloneSubtreeWithIds,
	insertTemplateAtSide,
	moveNodeToSide,
	appendSubtree,
	moveNodeInto,
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

	const accepts = (types: DOMStringList | readonly string[]): boolean => {
		const arr = Array.from(types as unknown as Iterable<string>);
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
		const rt = e.relatedTarget as Node | null;
		// уходим внутрь — игнор; при скролле rt часто = null — тоже игнор
		if (!rt || e.currentTarget.contains(rt)) return;
		dragInside.current = Math.max(0, dragInside.current - 1);
		if (dragInside.current === 0) setIsDragging(false);
	};

	const onRootDrop: React.DragEventHandler<HTMLDivElement> = () => {
		dragInside.current = 0;
		setIsDragging(false);
	};

	// подстраховка: если d’n’d завершился “вне”
	useEffect(() => {
		const end = () => {
			dragInside.current = 0;
			setIsDragging(false);
		};
		window.addEventListener('dragend', end);
		window.addEventListener('drop', end);
		return () => {
			window.removeEventListener('dragend', end);
			window.removeEventListener('drop', end);
		};
	}, []);

	const handleDropTemplate = (parentId: string, index: number, tplKey: string) => {
		const sub = resolveTemplate(tplKey);
		if (!sub) return;
		const cloned = cloneSubtreeWithIds(sub);
		const { next, patch } = insertSubtree(schema, cloned, parentId, index);
		onSchemaChange(next, patch);
	};

	const handleDropInside = (parentId: string, tplKey?: string, movingId?: string) => {
		if (tplKey) {
			const sub = resolveTemplate(tplKey);
			if (!sub) return;
			const cloned = cloneSubtreeWithIds(sub);
			const { next, patch } = appendSubtree(schema, cloned, parentId);
			onSchemaChange(next, patch);
			return;
		}
		if (movingId) {
			const { next, patch } = moveNodeInto(schema, movingId, parentId);
			onSchemaChange(next, patch);
		}
	};

	const handleDropAtSide = (
		refId: string,
		side: Side,
		tplKey?: string,
		movingId?: string,
	) => {
		if (tplKey) {
			const sub = resolveTemplate(tplKey);
			if (!sub) return;
			const { next, patch } = insertTemplateAtSide(schema, refId, side, sub);
			onSchemaChange(next, patch);
			return;
		}
		if (movingId) {
			const { next, patch } = moveNodeToSide(schema, refId, side, movingId);
			onSchemaChange(next, patch);
		}
	};

	const handleDropMove = (parentId: string, index: number, nodeId: string) => {
		const { next, patch } = moveNode(schema, nodeId, parentId, index);
		onSchemaChange(next, patch);
	};

	const handleDelete = (nodeId: string) => {
		if (schema.rootId === nodeId) return;
		const { next, patch } = removeNode(schema, nodeId);
		onSchemaChange(next, patch);
		onSelectNode?.(null);
	};

	return (
		<div
			data-editor-root=""
			onDragEnter={onRootDragEnter}
			onDragOver={onRootDragOver}
			onDragLeave={onRootDragLeave}
			onDrop={onRootDrop}
		>
			<style>{`
        /* перенос текста внутри редактора */
        [data-editor-root] h1,
        [data-editor-root] h2,
        [data-editor-root] h3,
        [data-editor-root] h4,
        [data-editor-root] h5,
        [data-editor-root] h6,
        [data-editor-root] p {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: normal;
          max-width: 100%;
        }
        /* ключевой фикс: flex-элементы могут сжиматься */
        [data-editor-root] [data-res-id] { min-width: 0; max-width: 100%; }
      `}</style>

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
				handleDropAtSide={handleDropAtSide}
				handleDropInside={handleDropInside}
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
	handleDropAtSide: (
		refId: string,
		side: Side,
		tplKey?: string,
		movingId?: string,
	) => void;
	handleDropInside: (parentId: string, tplKey?: string, movingId?: string) => void;
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
		handleDropAtSide,
		handleDropInside,
	} = props;

	const node = schema.nodes[id];
	if (!node) return null;

	const parentLike = isContainer(node);
	const children = getChildren(schema, id);

	const { base: baseStyle, mediaCssText } = mergeResponsive(theme, {
		style: node.props?.style,
	});
	const scopedCss = mediaCssText
		? mediaCssText.replaceAll('[data-res-id]', `[data-res-id="${id}"]`)
		: '';

	const axis: Axis = (() => {
		const disp = baseStyle?.display as React.CSSProperties['display'] | undefined;
		const fd = baseStyle?.flexDirection as
			| React.CSSProperties['flexDirection']
			| undefined;
		if (disp === 'flex' || disp === 'inline-flex') {
			return fd && fd.startsWith('column') ? 'y' : 'x';
		}
		return node.type === 'row' ? 'x' : 'y';
	})();

	const baseDisplay = baseStyle?.display as React.CSSProperties['display'] | undefined;
	const fixedBaseStyle =
		node.type === 'button' && !baseDisplay
			? { display: 'inline-block', ...baseStyle }
			: baseStyle;

	const containerEmpty = parentLike && children.length === 0;

	const accepts = (dt: DataTransfer) => {
		const t = Array.from(dt.types || []);
		return t.includes(TYPE_TPL) || t.includes(TYPE_MOVE);
	};

	return (
		<EditableNodeWrapper
			nodeId={id}
			parentId={schema.rootId === id ? id : (findParent(schema, id) ?? id)}
			index={0}
			onRemove={(nid) => onDelete(nid)}
			onSelect={(nid) => onSelect?.(nid)}
			isSelected={selectedId === id}
			canRemove={schema.rootId !== id}
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

				{parentLike ? (
					<div
						style={{
							display:
								axis === 'x'
									? (baseStyle?.display ?? 'flex')
									: baseStyle?.display,
							minHeight: containerEmpty ? 56 : undefined,
							padding: containerEmpty ? 8 : undefined,
							borderRadius: containerEmpty ? 8 : undefined,
							border:
								isDragging && containerEmpty
									? '2px dashed #e6e8ef'
									: undefined,
							background:
								isDragging && containerEmpty
									? 'rgba(92,124,250,0.03)'
									: undefined,
						}}
						onDragOver={(e) => {
							if (!containerEmpty || !isDragging) return;
							if (!accepts(e.dataTransfer)) return;
							e.preventDefault();
							try {
								const isMove = Array.from(
									e.dataTransfer.types || [],
								).includes(TYPE_MOVE);
								e.dataTransfer.dropEffect = isMove ? 'move' : 'copy';
							} catch {}
						}}
						onDrop={(e) => {
							if (!containerEmpty || !isDragging) return;
							e.preventDefault();
							const dt = e.dataTransfer;
							const tplKey = dt.getData(TYPE_TPL);
							const moveId = dt.getData(TYPE_MOVE);
							handleDropInside(
								id,
								tplKey || undefined,
								moveId || undefined,
							);
						}}
					>
						{children.map((cid, idx) => {
							const child = schema.nodes[cid];
							const isTextLike =
								child?.type === 'heading' ||
								child?.type === 'paragraph' ||
								child?.type === 'list' ||
								child?.type === 'listItem';
							// контейнеры (box/row/section/page) тоже должны тянуться по ширине
							const isFill =
								isTextLike ||
								(child ? isContainer(child) : false) ||
								child?.type === 'divider';

							if (axis === 'y') {
								// вертикальный список
								return (
									<div
										key={cid}
										style={{
											display: 'flex',
											alignItems: 'stretch',
											width: '100%',
										}}
									>
										{/* LEFT по высоте узла */}
										<DropZone
											onDrop={(tpl, moveId) =>
												handleDropAtSide(cid, 'left', tpl, moveId)
											}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
										/>

										{/* Колонка с узлом */}
										<div
											style={
												isFill
													? {
															display: 'flex',
															flexDirection: 'column',
															flex: '1 1 auto',
															minWidth: 0,
															maxWidth: '100%',
														}
													: {
															display: 'inline-flex',
															flexDirection: 'column',
															flex: '0 0 auto',
															minWidth: 0,
														}
											}
										>
											{idx === 0 && (
												<DropZone
													onDrop={(tpl, moveId) =>
														handleDropAtSide(
															cid,
															'top',
															tpl,
															moveId,
														)
													}
													scrollContainer={scrollContainer}
													visible={isDragging}
													axis="y"
													matchId={cid}
												/>
											)}

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
												handleDropAtSide={handleDropAtSide}
												handleDropInside={handleDropInside}
											/>

											<DropZone
												onDrop={(tpl, moveId) =>
													handleDropAtSide(
														cid,
														'bottom',
														tpl,
														moveId,
													)
												}
												scrollContainer={scrollContainer}
												visible={isDragging}
												axis="y"
												matchId={cid}
											/>
										</div>

										{/* RIGHT по высоте узла */}
										<DropZone
											onDrop={(tpl, moveId) =>
												handleDropAtSide(
													cid,
													'right',
													tpl,
													moveId,
												)
											}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
										/>
									</div>
								);
							}

							// горизонтальный список
							return (
								<div
									key={cid}
									style={{
										display: 'flex',
										flexDirection: 'column',
										minWidth: 0,
									}}
								>
									<DropZone
										onDrop={(tpl, moveId) =>
											handleDropAtSide(cid, 'top', tpl, moveId)
										}
										scrollContainer={scrollContainer}
										visible={isDragging}
										axis="y"
										matchId={cid}
									/>

									<div
										style={{
											display: 'flex',
											alignItems: 'stretch',
											minWidth: 0,
										}}
									>
										{idx === 0 && (
											<DropZone
												onDrop={(tpl, moveId) =>
													handleDropAtSide(
														cid,
														'left',
														tpl,
														moveId,
													)
												}
												scrollContainer={scrollContainer}
												visible={isDragging}
												axis="x"
												matchId={cid}
											/>
										)}

										{/* обёртка вокруг узла: тянем для текста/контейнеров */}
										<div
											style={
												isFill
													? {
															flex: '1 1 auto',
															minWidth: 0,
															maxWidth: '100%',
														}
													: {
															flex: '0 0 auto',
															minWidth: 0,
															display: 'inline-flex',
														}
											}
										>
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
												handleDropAtSide={handleDropAtSide}
												handleDropInside={handleDropInside}
											/>
										</div>

										<DropZone
											onDrop={(tpl, moveId) =>
												handleDropAtSide(
													cid,
													'right',
													tpl,
													moveId,
												)
											}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
										/>
									</div>

									<DropZone
										onDrop={(tpl, moveId) =>
											handleDropAtSide(cid, 'bottom', tpl, moveId)
										}
										scrollContainer={scrollContainer}
										visible={isDragging}
										axis="y"
										matchId={cid}
									/>
								</div>
							);
						})}
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
			const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			return React.createElement(tag, null, node.props?.text ?? 'Heading');
		}

		case 'paragraph':
			return <p>{node.props?.text ?? 'Text'}</p>;

		case 'richtext': {
			const html = node.props?.text ?? '';
			const hasHtml = /<[a-z][\s\S]*>/i.test(html);
			return hasHtml ? (
				<div dangerouslySetInnerHTML={{ __html: html }} />
			) : (
				<p>{html || 'Text'}</p>
			);
		}

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
				WebkitAppearance: 'none',
				MozAppearance: 'none',
				appearance: 'none',
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
