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
	cleanupSchemaBasic,
	mergePatches,
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

function dndContainerStyle(
	baseStyle: React.CSSProperties,
	axis: Axis,
	empty: boolean,
	dragging: boolean,
): React.CSSProperties {
	const disp = baseStyle.display;
	const isFlex = disp === 'flex' || disp === 'inline-flex';

	return {
		display:
			axis === 'x' ? (disp ?? 'flex') : (disp ?? (isFlex ? 'flex' : undefined)),
		flexDirection:
			baseStyle.flexDirection ??
			(axis === 'y' && (isFlex || disp == null) ? 'column' : undefined),

		flexWrap: baseStyle.flexWrap,
		alignItems: baseStyle.alignItems,
		justifyContent: baseStyle.justifyContent,
		gap: baseStyle.gap,

		minHeight: empty ? 56 : undefined,
		padding: empty ? 8 : undefined,
		borderRadius: empty ? 8 : undefined,
		border: dragging && empty ? '2px dashed #e6e8ef' : undefined,
		background: dragging && empty ? 'rgba(92,124,250,0.03)' : undefined,
	};
}

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
		if (!rt || e.currentTarget.contains(rt)) return;
		dragInside.current = Math.max(0, dragInside.current - 1);
		if (dragInside.current === 0) setIsDragging(false);
	};

	const onRootDrop: React.DragEventHandler<HTMLDivElement> = () => {
		dragInside.current = 0;
		setIsDragging(false);
	};

	const onEditorClickCapture: React.MouseEventHandler<HTMLDivElement> = (e) => {
		const t = e.target as HTMLElement;
		const a = t.closest('a[href]') as HTMLAnchorElement | null;
		if (a) {
			e.preventDefault();
		}
	};

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

	const applyAndClean = (next: PageSchema, p: SchemaPatch) => {
		const cleaned = cleanupSchemaBasic(next);
		onSchemaChange(cleaned.next, mergePatches(p, cleaned.patch));
	};

	const handleDropTemplate = (parentId: string, index: number, tplKey: string) => {
		const sub = resolveTemplate(tplKey);
		if (!sub) return;
		const cloned = cloneSubtreeWithIds(sub);
		const { next, patch } = insertSubtree(schema, cloned, parentId, index);
		applyAndClean(next, patch);
	};

	const handleDropInside = (parentId: string, tplKey?: string, movingId?: string) => {
		if (tplKey) {
			const sub = resolveTemplate(tplKey);
			if (!sub) return;
			const cloned = cloneSubtreeWithIds(sub);
			const { next, patch } = appendSubtree(schema, cloned, parentId);
			applyAndClean(next, patch);
			return;
		}
		if (movingId) {
			const { next, patch } = moveNodeInto(schema, movingId, parentId);
			applyAndClean(next, patch);
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
			applyAndClean(next, patch);
			return;
		}
		if (movingId) {
			const { next, patch } = moveNodeToSide(schema, refId, side, movingId);
			applyAndClean(next, patch);
		}
	};

	const handleDropMove = (parentId: string, index: number, nodeId: string) => {
		const { next, patch } = moveNode(schema, nodeId, parentId, index);
		applyAndClean(next, patch);
	};

	const handleDelete = (nodeId: string) => {
		if (schema.rootId === nodeId) return;
		const { next, patch } = removeNode(schema, nodeId);
		applyAndClean(next, patch);
		onSelectNode?.(null);
	};

	return (
		<div
			data-editor-root=""
			onDragEnter={onRootDragEnter}
			onDragOver={onRootDragOver}
			onDragLeave={onRootDragLeave}
			onDrop={onRootDrop}
			onClickCapture={onEditorClickCapture}
		>
			<style>{`
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

	const targetSelector = parentLike
		? `[data-res-id="${id}"]`
		: `[data-res-id="${id}"] [data-prim="true"]`;
	const scopedCss = mediaCssText
		? mediaCssText.replaceAll('[data-res-id]', targetSelector)
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

	const EDITOR_PAD = 14;
	const editorPadForContainer: React.CSSProperties = parentLike
		? {
				paddingTop: baseStyle.paddingTop ?? EDITOR_PAD,
				paddingLeft: baseStyle.paddingLeft ?? EDITOR_PAD,
				paddingRight: baseStyle.paddingRight ?? 6,
			}
		: {};

	const wrapperStyle: React.CSSProperties = {
		position: 'relative',
		userSelect: 'none',
		...(parentLike
			? {
					...(node.type === 'section' ? { width: '100%' } : {}),
					...editorPadForContainer,
					...baseStyle,
				}
			: node.type === 'divider'
				? {
					display: 'block',
					width: '100%',
					...baseStyle,
				}
				: {
					display: 'inline-flex',
					flex: '0 0 auto',
					minWidth: 0,
					verticalAlign: 'top',
				}),
	};

	const containerEmpty = parentLike && children.length === 0;

	const accepts = (dt: DataTransfer) => {
		const t = Array.from(dt.types || []);
		return (
			t.includes('application/x-block-template') ||
			t.includes('application/x-move-node')
		);
	};

	const containerLabel =
		parentLike &&
		(() => {
			const dir = (baseStyle.flexDirection as string | undefined)?.startsWith(
				'column',
			)
				? 'column'
				: 'row';
			const text =
				node.type === 'box'
					? `box (${dir})`
					: node.type === 'row'
						? `row`
						: node.type === 'section'
							? 'section'
							: node.type === 'page'
								? 'page'
								: node.type === 'form'
									? 'form'
									: node.type;
			return (
				<span
					style={{
						position: 'absolute',
						top: 2,
						left: 2,
						fontSize: 9,
						lineHeight: '14px',
						padding: '0 2px',
						borderRadius: 999,
						background: 'rgba(15,23,42,.06)',
						color: '#4b5563',
						pointerEvents: 'none',
						zIndex: 4,
					}}
				>
					{text}
				</span>
			);
		})();

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
					e.dataTransfer.setData('application/x-move-node', id);
					e.dataTransfer.effectAllowed = 'move';
				}}
				style={wrapperStyle}
				onClick={(e) => {
					e.stopPropagation();
					onSelect?.(id);
				}}
			>
				{scopedCss && <style dangerouslySetInnerHTML={{ __html: scopedCss }} />}

				{parentLike && containerLabel}

				{parentLike ? (
					<div
						style={dndContainerStyle(
							baseStyle,
							axis,
							containerEmpty,
							isDragging,
						)}
						onDragOver={(e) => {
							if (!containerEmpty || !isDragging) return;
							if (!accepts(e.dataTransfer)) return;
							e.preventDefault();
							try {
								const isMove = Array.from(
									e.dataTransfer.types || [],
								).includes('application/x-move-node');
								e.dataTransfer.dropEffect = isMove ? 'move' : 'copy';
							} catch {}
						}}
						onDrop={(e) => {
							if (!containerEmpty || !isDragging) return;
							e.preventDefault();
							const dt = e.dataTransfer;
							const tplKey = dt.getData('application/x-block-template');
							const moveId = dt.getData('application/x-move-node');
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
							const isFill =
								isTextLike ||
								(child ? isContainer(child) : false) ||
								child?.type === 'divider';

							if (axis === 'y') {
								return (
									<div
										key={cid}
										style={{
											display: 'flex',
											alignItems: 'stretch',
											width: '100%',
										}}
									>
										<DropZone
											onDrop={(tpl, moveId) =>
												handleDropAtSide(cid, 'left', tpl, moveId)
											}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
										/>
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
					renderPrimitive(node, baseStyle, theme)
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

function renderPrimitive(node: NodeJson, baseStyle: React.CSSProperties, theme: ThemeTokens) {
	switch (node.type) {
		case 'form':
			return (
				<form
					action={node.props?.formAction}
					method={node.props?.formMethod}
					encType={node.props?.enctype}
				></form>
			);

		case 'page':
		case 'section':
		case 'box':
		case 'row':
			return <div data-prim="true" />;

		case 'heading': {
			const level = (node.props?.level ?? 2) as 1 | 2 | 3 | 4 | 5 | 6;
			const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			return (
				<Tag data-prim="true" style={baseStyle}>
					{node.props?.text ?? 'Heading'}
				</Tag>
			);
		}

		case 'paragraph':
			return (
				<p data-prim="true" style={baseStyle}>
					{node.props?.text ?? 'Text'}
				</p>
			);

		case 'richtext': {
			const html = node.props?.text ?? '';
			const hasHtml = /<[a-z][\s\S]*>/i.test(html);
			return hasHtml ? (
				<>
					<style>
						{
							`blockquote {
							  background: ${theme.components?.blockquote?.bg || 'rgba(99, 102, 241, 0.1)'};
							  border-left: ${theme.components?.blockquote?.borderLeft || '4px solid rgb(59, 130, 246)'};
							  border-radius: ${theme.components?.blockquote?.radius || '8'}px;
							  padding: ${theme.components?.blockquote?.p || '16px 20px'};
							  color: ${theme.components?.blockquote?.color};
							  font-style: italic;
							}`
						}
					</style>
					<div
						data-prim="true"
						style={baseStyle}
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				</>

			) : (
				<p data-prim="true" style={baseStyle}>
					{html || 'Text'}
				</p>
			);
		}

		case 'image':
			return (
				<img
					data-prim="true"
					src={node.props?.src}
					alt={node.props?.alt ?? ''}
					style={{ maxWidth: '100%', display: 'block', ...baseStyle }}
				/>
			);

		case 'button': {
			const label = node.props?.text ?? 'Button';
			if (node.props?.href) {
				return (
					<a
						data-prim="true"
						href={node.props.href}
						style={{
							...baseStyle,
							display: 'inline-block',
							textDecoration: 'none',
						}}
					>
						{label}
					</a>
				);
			}
			return (
				<button
					data-prim="true"
					type="button"
					style={{ ...baseStyle, display: 'inline-block' }}
				>
					{label}
				</button>
			);
		}

		case 'divider':
			return <div style={baseStyle} />

		case 'list':
			return <ul data-prim="true" style={baseStyle} />;

		case 'listItem':
			return (
				<li data-prim="true" style={baseStyle}>
					{node.props?.text ?? ''}
				</li>
			);

		case 'blockquote': {
			const footerStyle: React.CSSProperties = {
				fontSize: 12,
				color: '#888',
				marginTop: 8,
			};
			return (
				<blockquote data-prim="true" style={baseStyle}>
					{node.props?.text ?? 'Цитата'}
					{(node.props?.preAuthor || node.props?.cite) && (
						<p style={footerStyle}>
							{node.props?.preAuthor}
							{node.props?.cite && (
								<cite style={{ marginLeft: 8, fontStyle: 'italic' }}>
									{node.props.cite}
								</cite>
							)}
						</p>
					)}
				</blockquote>
			);
		}

		case 'input': {
			const id = `input-${node.id}`;
			const input = (
				<input
					id={id}
					type={node.props?.type || 'text'}
					name={node.props?.name}
					value={node.props?.value}
					placeholder={node.props?.placeholder}
					min={node.props?.min}
					max={node.props?.max}
					step={node.props?.step}
					minLength={node.props?.minlength}
					maxLength={node.props?.maxlength}
					pattern={node.props?.pattern}
					title={node.props?.title}
					size={node.props?.size}
					required={node.props?.required}
					disabled={node.props?.disabled}
					readOnly={node.props?.readonly}
					autoComplete={node.props?.autocomplete ? 'on' : 'off'}
					autoFocus={node.props?.autofocus}
					style={baseStyle}
				/>
			);

			return node.props?.label ? (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						gap: '4px',
					}}
				>
					<label htmlFor={id} style={{ fontSize: '14px', color: '#4a5568' }}>
						{node.props.label}
					</label>
					{input}
				</div>
			) : (
				input
			);
		}

		case 'textarea': {
			const id = `textarea-${node.id}`;
			const textarea = (
				<textarea
					id={id}
					name={node.props?.name}
					rows={node.props?.rows}
					cols={node.props?.cols}
					placeholder={node.props?.placeholder}
					disabled={node.props?.disabled}
					readOnly={node.props?.readonly}
					required={node.props?.required}
					maxLength={node.props?.maxlength}
					minLength={node.props?.minlength}
					autoFocus={node.props?.autofocus}
					form={node.props?.formId}
					wrap={node.props?.wrap}
					autoComplete={node.props?.autocomplete ? 'on' : 'off'}
					spellCheck={node.props?.spellcheck}
					title={node.props?.title}
					style={baseStyle}
				>
					{node.props?.value}
				</textarea>
			);

			return node.props?.label ? (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						gap: '4px',
					}}
				>
					<label htmlFor={id} style={{ fontSize: '14px', color: '#4a5568' }}>
						{node.props.label}
					</label>
					{textarea}
				</div>
			) : (
				textarea
			);
		}

		case 'select': {
			const id = `select-${node.id}`;
			const select = (
				<select
					id={id}
					name={node.props?.name}
					disabled={node.props?.disabled}
					required={node.props?.required}
					autoFocus={node.props?.autofocus}
					multiple={node.props?.multiple}
					size={node.props?.size}
					form={node.props?.formId}
					style={baseStyle}
				>
					{node.props?.options?.map((option, index) => (
						<option key={index} value={option.value}>
							{option.text}
						</option>
					))}
				</select>
			);

			return node.props?.label ? (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						gap: '4px',
					}}
				>
					<label htmlFor={id} style={{ fontSize: '14px', color: '#4a5568' }}>
						{node.props.label}
					</label>
					{select}
				</div>
			) : (
				select
			);
		}

		default:
			return null;
	}
}
