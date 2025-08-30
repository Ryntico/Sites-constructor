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
	cloneSubtreeWithIdsForAnchor,
	insertTemplateAtSide,
	moveNodeToSide,
	appendSubtree,
	moveNodeInto,
	cleanupSchemaBasic,
	mergePatches,
	extractSubtree,
	duplicateNode,
} from './schemaOps';
import { DropZone } from '../components/DropZones';
import { EditableNodeWrapper } from '../components/EditableNodeWrapper';

const TYPE_MOVE = 'application/x-move-node';
const TYPE_TPL = 'application/x-block-template';
const TYPE_COPY_INTENT = 'application/x-copy-intent';

const IS_MAC =
	typeof navigator !== 'undefined' &&
	(/Mac|iPhone|iPad|iPod/i.test(navigator.platform) ||
		/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));

function typesToArray(types: DataTransfer['types']): string[] {
	const maybeIterable = types as unknown as { [Symbol.iterator]?: unknown };
	if (typeof maybeIterable[Symbol.iterator] === 'function') {
		return Array.from(types as unknown as Iterable<string>);
	}
	const list = types as unknown as { length: number; item(i: number): string | null };
	const out: string[] = [];
	for (let i = 0; i < list.length; i++) {
		const v = list.item(i);
		if (v) out.push(v);
	}
	return out;
}

function isCopyKeyLike(
	k: { altKey: boolean; metaKey: boolean; ctrlKey: boolean },
	isMac: boolean,
): boolean {
	return isMac ? k.metaKey || k.altKey : k.ctrlKey || k.altKey;
}

function useCopyKey(isMac: boolean): React.RefObject<boolean> {
	const ref = useRef(false);

	useEffect(() => {
		const fromKey = (e: KeyboardEvent) => {
			ref.current = isCopyKeyLike(e, isMac);
		};
		const fromDragOver = (e: DragEvent) => {
			ref.current = isCopyKeyLike(e, isMac);
		};
		const reset = () => {
			ref.current = false;
		};
		const onVis = () => {
			if (document.visibilityState !== 'visible') reset();
		};

		window.addEventListener('keydown', fromKey, true);
		window.addEventListener('keyup', fromKey, true);
		window.addEventListener('dragover', fromDragOver, true);
		window.addEventListener('dragend', reset, true);
		window.addEventListener('drop', reset, true);
		window.addEventListener('blur', reset, true);
		document.addEventListener('visibilitychange', onVis, true);

		return () => {
			window.removeEventListener('keydown', fromKey, true);
			window.removeEventListener('keyup', fromKey, true);
			window.removeEventListener('dragover', fromDragOver, true);
			window.removeEventListener('dragend', reset, true);
			window.removeEventListener('drop', reset, true);
			window.removeEventListener('blur', reset, true);
			document.removeEventListener('visibilitychange', onVis, true);
		};
	}, [isMac]);

	return ref;
}

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
	const copyKeyRef = useCopyKey(IS_MAC);

	const accepts = (types: DataTransfer['types']): boolean => {
		const arr = typesToArray(types);
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
		if (a) e.preventDefault();
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
			const cloned = tplKey === 'anchor' ? cloneSubtreeWithIdsForAnchor(sub) : cloneSubtreeWithIds(sub);
			if (Array.isArray(cloned)) {
				let newSchema: PageSchema = schema;
				cloned.forEach((node) => {
					const { next, patch } = appendSubtree(newSchema, node, parentId);
					newSchema = next;
					applyAndClean(newSchema, patch);
				});
			}
			else {
				const { next, patch } = appendSubtree(schema, cloned, parentId);
				applyAndClean(next, patch);
			}
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
			const cloned = tplKey === 'anchor' ? cloneSubtreeWithIdsForAnchor(sub) : cloneSubtreeWithIds(sub);

			if (Array.isArray(cloned)) {
				let newSchema: PageSchema = schema;
				cloned.forEach((node) => {
					const { next, patch } = insertTemplateAtSide(newSchema, refId, side, node);
					newSchema = next;
					applyAndClean(newSchema, patch);
				});
			}
			else {
				const { next, patch } = insertTemplateAtSide(schema, refId, side, cloned);
				applyAndClean(next, patch);
			}
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

	const handleDuplicate = (nodeId: string) => {
		const { next, patch } = duplicateNode(schema, nodeId);
		onSchemaChange(next, patch);
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
				onDuplicate={handleDuplicate}
				onSelect={onSelectNode}
				scrollContainer={scrollContainer}
				isRoot
				isDragging={isDragging}
				selectedId={selectedId}
				handleDropAtSide={handleDropAtSide}
				handleDropInside={handleDropInside}
				applyAndClean={applyAndClean}
				isMac={IS_MAC}
				copyKeyRef={copyKeyRef}
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
	onDuplicate: (nodeId: string) => void;
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
	applyAndClean: (schema: PageSchema, patch: SchemaPatch) => void;
	isMac: boolean;
	copyKeyRef: React.RefObject<boolean>;
}) {
	const {
		id,
		schema,
		theme,
		onDropTemplate,
		onDropMove,
		onDelete,
		onDuplicate,
		onSelect,
		isRoot,
		scrollContainer,
		isDragging,
		selectedId,
		handleDropAtSide,
		handleDropInside,
		applyAndClean,
		isMac,
		copyKeyRef,
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
		const arr = typesToArray(dt.types);
		return arr.includes(TYPE_TPL) || arr.includes(TYPE_MOVE);
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
			onDuplicate={onDuplicate}
		>
			<div
				data-res-id={id}
				draggable={!isRoot}
				onPointerDownCapture={(ev) => {
					const el = ev.currentTarget as HTMLElement;
					const willCopy = IS_MAC
						? ev.metaKey || ev.altKey
						: ev.ctrlKey || ev.altKey;
					el.dataset.copyIntent = willCopy ? '1' : '0';
				}}
				onDragStart={(e) => {
					if (isRoot) return;
					e.stopPropagation();
					e.dataTransfer.setData(TYPE_MOVE, id);

					const el = e.currentTarget as HTMLElement;
					const prelocked = el.dataset.copyIntent === '1';
					e.dataTransfer.setData(TYPE_COPY_INTENT, prelocked ? '1' : '0');

					e.dataTransfer.effectAllowed = 'copyMove';
				}}
				onDragEnd={(e) => {
					const el = e.currentTarget as HTMLElement;
					if (el.dataset.copyIntent) el.dataset.copyIntent = '0';
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

							const wantCopy = IS_MAC ? e.altKey : e.ctrlKey || e.altKey;
							try {
								const isMove = typesToArray(
									e.dataTransfer.types,
								).includes(TYPE_MOVE);
								e.dataTransfer.dropEffect = wantCopy
									? 'copy'
									: isMove
										? 'move'
										: 'copy';
							} catch {
								// no ops
							}
						}}
						onDrop={(e) => {
							if (!containerEmpty || !isDragging) return;
							e.preventDefault();

							const dt = e.dataTransfer;
							const tplKey = dt.getData(TYPE_TPL);
							const moveId = dt.getData(TYPE_MOVE);

							const copyIntent = dt.getData(TYPE_COPY_INTENT) === '1';
							const copyNow = IS_MAC ? e.altKey : e.ctrlKey || e.altKey;
							const copy = copyIntent || copyNow;

							if (tplKey) {
								handleDropInside(id, tplKey, undefined);
								return;
							}
							if (moveId) {
								if (copy) {
									const sub = extractSubtree(schema, moveId);
									const cloned = cloneSubtreeWithIds(sub);
									const { next, patch } = appendSubtree(
										schema,
										cloned,
										id,
									);
									applyAndClean(next, patch);
								} else {
									handleDropInside(id, undefined, moveId);
								}
							}
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
											onDrop={(tpl, moveId, opts) => {
												const copy = !!opts?.copy;
												if (tpl) {
													handleDropAtSide(
														cid,
														'left',
														tpl,
														undefined,
													);
												} else if (moveId) {
													if (copy) {
														copyNodeAtSide(
															schema,
															cid,
															'left',
															moveId,
															applyAndClean,
														);
													} else {
														handleDropAtSide(
															cid,
															'left',
															undefined,
															moveId,
														);
													}
												}
											}}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
											copyKeyRef={copyKeyRef}
											isMac={isMac}
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
													onDrop={(tpl, moveId, opts) => {
														const copy = !!opts?.copy;
														if (tpl) {
															handleDropAtSide(
																cid,
																'top',
																tpl,
																undefined,
															);
														} else if (moveId) {
															if (copy) {
																copyNodeAtSide(
																	schema,
																	cid,
																	'top',
																	moveId,
																	applyAndClean,
																);
															} else {
																handleDropAtSide(
																	cid,
																	'top',
																	undefined,
																	moveId,
																);
															}
														}
													}}
													scrollContainer={scrollContainer}
													visible={isDragging}
													axis="y"
													matchId={cid}
													copyKeyRef={copyKeyRef}
													isMac={isMac}
												/>
											)}

											<NodeView
												id={cid}
												schema={schema}
												theme={theme}
												onDropTemplate={onDropTemplate}
												onDropMove={onDropMove}
												onDelete={onDelete}
												onDuplicate={onDuplicate}
												onSelect={onSelect}
												scrollContainer={scrollContainer}
												isDragging={isDragging}
												selectedId={selectedId}
												handleDropAtSide={handleDropAtSide}
												handleDropInside={handleDropInside}
												applyAndClean={applyAndClean}
												isMac={IS_MAC}
												copyKeyRef={copyKeyRef}
											/>

											<DropZone
												onDrop={(tpl, moveId, opts) => {
													const copy = !!opts?.copy;
													if (tpl) {
														handleDropAtSide(
															cid,
															'bottom',
															tpl,
															undefined,
														);
													} else if (moveId) {
														if (copy) {
															copyNodeAtSide(
																schema,
																cid,
																'bottom',
																moveId,
																applyAndClean,
															);
														} else {
															handleDropAtSide(
																cid,
																'bottom',
																undefined,
																moveId,
															);
														}
													}
												}}
												scrollContainer={scrollContainer}
												visible={isDragging}
												axis="y"
												matchId={cid}
												copyKeyRef={copyKeyRef}
												isMac={isMac}
											/>
										</div>
										<DropZone
											onDrop={(tpl, moveId, opts) => {
												const copy = !!opts?.copy;
												if (tpl) {
													handleDropAtSide(
														cid,
														'right',
														tpl,
														undefined,
													);
												} else if (moveId) {
													if (copy) {
														copyNodeAtSide(
															schema,
															cid,
															'right',
															moveId,
															applyAndClean,
														);
													} else {
														handleDropAtSide(
															cid,
															'right',
															undefined,
															moveId,
														);
													}
												}
											}}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
											copyKeyRef={copyKeyRef}
											isMac={isMac}
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
										onDrop={(tpl, moveId, opts) => {
											const copy = !!opts?.copy;
											if (tpl) {
												handleDropAtSide(
													cid,
													'top',
													tpl,
													undefined,
												);
											} else if (moveId) {
												if (copy) {
													copyNodeAtSide(
														schema,
														cid,
														'top',
														moveId,
														applyAndClean,
													);
												} else {
													handleDropAtSide(
														cid,
														'top',
														undefined,
														moveId,
													);
												}
											}
										}}
										scrollContainer={scrollContainer}
										visible={isDragging}
										axis="y"
										matchId={cid}
										copyKeyRef={copyKeyRef}
										isMac={isMac}
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
												onDrop={(tpl, moveId, opts) => {
													const copy = !!opts?.copy;
													if (tpl) {
														handleDropAtSide(
															cid,
															'left',
															tpl,
															undefined,
														);
													} else if (moveId) {
														if (copy) {
															copyNodeAtSide(
																schema,
																cid,
																'left',
																moveId,
																applyAndClean,
															);
														} else {
															handleDropAtSide(
																cid,
																'left',
																undefined,
																moveId,
															);
														}
													}
												}}
												scrollContainer={scrollContainer}
												visible={isDragging}
												axis="x"
												matchId={cid}
												copyKeyRef={copyKeyRef}
												isMac={isMac}
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
												onDuplicate={onDuplicate}
												onSelect={onSelect}
												scrollContainer={scrollContainer}
												isDragging={isDragging}
												selectedId={selectedId}
												handleDropAtSide={handleDropAtSide}
												handleDropInside={handleDropInside}
												applyAndClean={applyAndClean}
												isMac={IS_MAC}
												copyKeyRef={copyKeyRef}
											/>
										</div>

										<DropZone
											onDrop={(tpl, moveId, opts) => {
												const copy = !!opts?.copy;
												if (tpl) {
													handleDropAtSide(
														cid,
														'right',
														tpl,
														undefined,
													);
												} else if (moveId) {
													if (copy) {
														copyNodeAtSide(
															schema,
															cid,
															'right',
															moveId,
															applyAndClean,
														);
													} else {
														handleDropAtSide(
															cid,
															'right',
															undefined,
															moveId,
														);
													}
												}
											}}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
											copyKeyRef={copyKeyRef}
											isMac={isMac}
										/>
									</div>

									<DropZone
										onDrop={(tpl, moveId, opts) => {
											const copy = !!opts?.copy;
											if (tpl) {
												handleDropAtSide(
													cid,
													'bottom',
													tpl,
													undefined,
												);
											} else if (moveId) {
												if (copy) {
													copyNodeAtSide(
														schema,
														cid,
														'bottom',
														moveId,
														applyAndClean,
													);
												} else {
													handleDropAtSide(
														cid,
														'bottom',
														undefined,
														moveId,
													);
												}
											}
										}}
										scrollContainer={scrollContainer}
										visible={isDragging}
										axis="y"
										matchId={cid}
										copyKeyRef={copyKeyRef}
										isMac={isMac}
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

function copyNodeAtSide(
	schema: PageSchema,
	refId: string,
	side: Side,
	moveId: string,
	applyAndClean: (schema: PageSchema, patch: SchemaPatch) => void,
) {
	const sub = extractSubtree(schema, moveId);
	const cloned = cloneSubtreeWithIds(sub);
	const { next, patch } = insertTemplateAtSide(schema, refId, side, cloned);
	applyAndClean(next, patch);
}

function renderPrimitive(
	node: NodeJson,
	baseStyle: React.CSSProperties,
	theme: ThemeTokens,
) {
	switch (node.type) {
		case 'form':
			return (
				<form
					action={node.props?.formAction}
					method={node.props?.formMethod}
					encType={node.props?.enctype}
				/>
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
					<style>{`blockquote {
            background: ${theme.components?.blockquote?.bg || 'rgba(99, 102, 241, 0.1)'};
            border-left: ${theme.components?.blockquote?.borderLeft || '4px solid rgb(59, 130, 246)'};
            border-radius: ${theme.components?.blockquote?.radius || '8'}px;
            padding: ${theme.components?.blockquote?.p || '16px 20px'};
            color: ${theme.components?.blockquote?.color};
            font-style: italic;
          }`}</style>
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
			return <div>---------------------Разделитель---------------------</div>;

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

		case 'anchor': {
			return <div
				id={node.id}
				style={{ ...baseStyle, width: 100 }}
				title="Не отображается на сайте и превью"
			>Якорь ⚓</div>
		}

		default:
			return null;
	}
}
