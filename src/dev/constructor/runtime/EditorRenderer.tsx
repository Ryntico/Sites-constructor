import React, { useEffect, useRef, useState } from 'react';
import type {
	PageSchema,
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
	moveNode,
	removeNode,
	insertTemplateAtSide,
	moveNodeToSide,
	appendSubtree,
	moveNodeInto,
	extractSubtree,
	duplicateNode,
	findParentId,
	cloneSubtreeWithIds,
	insertSubtree,
} from './schemaOps';
import { DropZone } from '../components/DropZones';
import { EditableNodeWrapper } from '../components/EditableNodeWrapper';

import { IS_MAC, TYPE_MOVE, TYPE_TPL, TYPE_COPY_INTENT } from './dnd/constants';
import { typesToArray } from './dnd/utils';
import { useCopyKey } from './hooks/useCopyKey';
import { commitWithCleanup } from './ops/commit';
import { materializeTemplate } from './ops/materializeTemplate';
import { appendMany, insertManyAtSide } from './ops/insertions';
import { renderPrimitive } from './render/primitives';
import { dndContainerStyle } from '@/dev/constructor/runtime/styles/dndContainerStyle.ts';
import { ContainerLabel } from '@/dev/constructor/components/ContainerLabel.tsx';
import {
	computeAxis,
	isFillLike,
	buildContainerWrapStyle,
	acceptsDt,
} from './render/helpers';

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

	const accepts = (types: DataTransfer['types']): boolean => acceptsDt(types);

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

	const commit = (next: PageSchema, patch: SchemaPatch) =>
		commitWithCleanup(next, patch, onSchemaChange);

	const insertInside = (
		parentId: string,
		tplKey?: string,
		movingId?: string,
		opts?: { copy?: boolean },
	) => {
		if (tplKey) {
			const sub = resolveTemplate(tplKey);
			if (!sub) return;
			const subs = materializeTemplate(tplKey, sub);
			const { next, patch } = appendMany(schema, subs, parentId);
			commit(next, patch);
			return;
		}
		if (movingId) {
			if (opts?.copy) {
				const sub = extractSubtree(schema, movingId);
				const cloned = cloneSubtreeWithIds(sub);
				const { next, patch } = appendSubtree(schema, cloned, parentId);
				commit(next, patch);
			} else {
				const { next, patch } = moveNodeInto(schema, movingId, parentId);
				commit(next, patch);
			}
		}
	};

	const insertAtSide = (
		refId: string,
		side: Side,
		tplKey?: string,
		movingId?: string,
		opts?: { copy?: boolean },
	) => {
		if (tplKey) {
			const sub = resolveTemplate(tplKey);
			if (!sub) return;
			const subs = materializeTemplate(tplKey, sub);
			const { next, patch } = insertManyAtSide(schema, refId, side, subs);
			commit(next, patch);
			return;
		}
		if (movingId) {
			if (opts?.copy) {
				const sub = extractSubtree(schema, movingId);
				const cloned = cloneSubtreeWithIds(sub);
				const { next, patch } = insertTemplateAtSide(schema, refId, side, cloned);
				commit(next, patch);
			} else {
				const { next, patch } = moveNodeToSide(schema, refId, side, movingId);
				commit(next, patch);
			}
		}
	};

	const handleDropMove = (parentId: string, index: number, nodeId: string) => {
		const { next, patch } = moveNode(schema, nodeId, parentId, index);
		commit(next, patch);
	};

	const handleDelete = (nodeId: string) => {
		if (schema.rootId === nodeId) return;
		const { next, patch } = removeNode(schema, nodeId);
		commit(next, patch);
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
			<style>{`[data-editor-root] h1,
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
      [data-editor-root] [data-res-id] { min-width: 0; max-width: 100%; }`}</style>

			<NodeView
				id={schema.rootId}
				schema={schema}
				theme={theme}
				onDropTemplate={(pid, index, tpl) => {
					const sub = resolveTemplate(tpl);
					if (!sub) return;
					const subs = materializeTemplate(tpl, sub);
					let cur = schema;
					let combined: SchemaPatch = { set: {}, del: [] };
					subs.forEach((s, i) => {
						const { next, patch } = insertSubtree(cur, s, pid, index + i);
						cur = next;
						combined = {
							set: { ...combined.set, ...patch.set },
							del: [...combined.del, ...patch.del],
						};
					});
					commit(cur, combined);
				}}
				onDropMove={handleDropMove}
				onDelete={handleDelete}
				onDuplicate={handleDuplicate}
				onSelect={onSelectNode}
				scrollContainer={scrollContainer}
				isRoot
				isDragging={isDragging}
				selectedId={selectedId}
				handleDropAtSide={(refId, side, tplKey, movingId, opts) =>
					insertAtSide(refId, side, tplKey, movingId, opts)
				}
				handleDropInside={(parentId, tplKey, movingId, opts) =>
					insertInside(parentId, tplKey, movingId, opts)
				}
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
		opts?: { copy?: boolean },
	) => void;
	handleDropInside: (
		parentId: string,
		tplKey?: string,
		movingId?: string,
		opts?: { copy?: boolean },
	) => void;
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
		onSelect,
		isRoot,
		scrollContainer,
		isDragging,
		selectedId,
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

	const axis: Axis = computeAxis(baseStyle, node.type);

	const EDITOR_PAD = 14;

	const wrapperStyle: React.CSSProperties = parentLike
		? {
				position: 'relative',
				userSelect: 'none',
				...(node.type === 'section' ? { width: '100%' } : {}),
				...buildContainerWrapStyle(baseStyle, EDITOR_PAD),
			}
		: node.type === 'divider'
			? {
					position: 'relative',
					userSelect: 'none',
					display: 'block',
					width: '100%',
					...baseStyle,
				}
			: {
					position: 'relative',
					userSelect: 'none',
					display: 'inline-flex',
					flex: '0 0 auto',
					minWidth: 0,
					verticalAlign: 'top',
				};

	const containerEmpty = parentLike && children.length === 0;

	return (
		<EditableNodeWrapper
			nodeId={id}
			parentId={schema.rootId === id ? id : (findParentId(schema, id) ?? id)}
			index={0}
			onRemove={(nid) => onDelete(nid)}
			onSelect={(nid) => onSelect?.(nid)}
			isSelected={selectedId === id}
			canRemove={schema.rootId !== id}
			onDuplicate={(nid) => props.onDuplicate(nid)}
		>
			<div
				data-res-id={id}
				draggable={!isRoot}
				onPointerDownCapture={(ev) => {
					const el = ev.currentTarget as HTMLElement;
					const willCopy = isMac
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

				{parentLike ? (
					<div
						style={dndContainerStyle(
							{
								...baseStyle,
								paddingTop: baseStyle.paddingTop ?? EDITOR_PAD,
								paddingLeft: baseStyle.paddingLeft ?? EDITOR_PAD,
								paddingRight: baseStyle.paddingRight ?? 6,
							},
							axis,
							containerEmpty,
							props.isDragging,
						)}
						onDragOver={(e) => {
							if (!containerEmpty || !isDragging) return;
							if (!acceptsDt(e.dataTransfer)) return;
							e.preventDefault();
							try {
								const wantCopy =
									(copyKeyRef.current ?? false) ||
									(isMac ? e.altKey : e.ctrlKey || e.altKey);
								const isMove =
									acceptsDt(e.dataTransfer) &&
									typesToArray(e.dataTransfer.types).includes(
										TYPE_MOVE,
									);
								e.dataTransfer.dropEffect = wantCopy
									? 'copy'
									: isMove
										? 'move'
										: 'copy';
							} catch {
								// noop
							}
						}}
						onDrop={(e) => {
							if (!containerEmpty || !isDragging) return;
							e.preventDefault();
							const dt = e.dataTransfer;
							const tplKey = dt.getData(TYPE_TPL);
							const moveId = dt.getData(TYPE_MOVE);
							const copyIntent = dt.getData(TYPE_COPY_INTENT) === '1';
							const copyNow =
								(props.copyKeyRef.current ?? false) ||
								(props.isMac ? e.altKey : e.ctrlKey || e.altKey);
							const copy = copyIntent || copyNow;
							if (tplKey)
								props.handleDropInside(id, tplKey, undefined, { copy });
							else if (moveId)
								props.handleDropInside(id, undefined, moveId, { copy });
						}}
					>
						<ContainerLabel type={node.type} base={baseStyle} />

						{children.map((cid, idx) => {
							const isFill = isFillLike(schema, cid);

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
											onDrop={(tpl, moveId, opts) =>
												props.handleDropAtSide(
													cid,
													'left',
													tpl,
													moveId,
													opts,
												)
											}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
											copyKeyRef={props.copyKeyRef}
											isMac={props.isMac}
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
													onDrop={(tpl, moveId, opts) =>
														props.handleDropAtSide(
															cid,
															'top',
															tpl,
															moveId,
															opts,
														)
													}
													scrollContainer={scrollContainer}
													visible={isDragging}
													axis="y"
													matchId={cid}
													copyKeyRef={props.copyKeyRef}
													isMac={props.isMac}
												/>
											)}

											<NodeView
												id={cid}
												schema={schema}
												theme={theme}
												onDropTemplate={onDropTemplate}
												onDropMove={onDropMove}
												onDelete={onDelete}
												onDuplicate={props.onDuplicate}
												onSelect={onSelect}
												scrollContainer={scrollContainer}
												isDragging={isDragging}
												selectedId={props.selectedId}
												handleDropAtSide={props.handleDropAtSide}
												handleDropInside={props.handleDropInside}
												isMac={props.isMac}
												copyKeyRef={props.copyKeyRef}
											/>

											<DropZone
												onDrop={(tpl, moveId, opts) =>
													props.handleDropAtSide(
														cid,
														'bottom',
														tpl,
														moveId,
														opts,
													)
												}
												scrollContainer={scrollContainer}
												visible={isDragging}
												axis="y"
												matchId={cid}
												copyKeyRef={props.copyKeyRef}
												isMac={props.isMac}
											/>
										</div>
										<DropZone
											onDrop={(tpl, moveId, opts) =>
												props.handleDropAtSide(
													cid,
													'right',
													tpl,
													moveId,
													opts,
												)
											}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
											copyKeyRef={props.copyKeyRef}
											isMac={props.isMac}
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
										onDrop={(tpl, moveId, opts) =>
											props.handleDropAtSide(
												cid,
												'top',
												tpl,
												moveId,
												opts,
											)
										}
										scrollContainer={scrollContainer}
										visible={isDragging}
										axis="y"
										matchId={cid}
										copyKeyRef={props.copyKeyRef}
										isMac={props.isMac}
									/>

									<div
										style={{
											display: 'flex',
											alignItems: 'stretch',
											minWidth: 0,
										}}
									>
										<DropZone
											onDrop={(tpl, moveId, opts) =>
												props.handleDropAtSide(
													cid,
													'left',
													tpl,
													moveId,
													opts,
												)
											}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
											copyKeyRef={props.copyKeyRef}
											isMac={props.isMac}
										/>

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
												onDuplicate={props.onDuplicate}
												onSelect={onSelect}
												scrollContainer={scrollContainer}
												isDragging={isDragging}
												selectedId={props.selectedId}
												handleDropAtSide={props.handleDropAtSide}
												handleDropInside={props.handleDropInside}
												isMac={props.isMac}
												copyKeyRef={props.copyKeyRef}
											/>
										</div>

										<DropZone
											onDrop={(tpl, moveId, opts) =>
												props.handleDropAtSide(
													cid,
													'right',
													tpl,
													moveId,
													opts,
												)
											}
											scrollContainer={scrollContainer}
											visible={isDragging}
											axis="x"
											matchId={cid}
											copyKeyRef={props.copyKeyRef}
											isMac={props.isMac}
										/>
									</div>

									<DropZone
										onDrop={(tpl, moveId, opts) =>
											props.handleDropAtSide(
												cid,
												'bottom',
												tpl,
												moveId,
												opts,
											)
										}
										scrollContainer={scrollContainer}
										visible={isDragging}
										axis="y"
										matchId={cid}
										copyKeyRef={props.copyKeyRef}
										isMac={props.isMac}
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
