import React from 'react';
import type { Axis, PageSchema, Side, ThemeTokens } from '@/types/siteTypes';
import { mergeResponsive } from '@/dev/constructor/render/responsive.ts';
import {
	isContainer,
	getChildren,
	findParentId,
} from '@/dev/constructor/ops/schemaOps.ts';

import {
	TYPE_MOVE,
	TYPE_TPL,
	TYPE_COPY_INTENT,
} from '@/dev/constructor/runtime/dnd/constants';
import { acceptsDt, typesToArray } from '@/dev/constructor/runtime/dnd/utils';

import { renderPrimitive } from '@/dev/constructor/render/primitives';
import {
	computeAxis,
	isFillLike,
	buildWrapperStyle,
	buildCenterStyle,
} from '@/dev/constructor/render/helpers';

import { dndContainerStyle } from '@/dev/constructor/styles/dndContainerStyle';
import { ContainerLabel } from '@/dev/constructor/components/ContainerLabel';
import { ChildFrame } from '@/dev/constructor/components/ChildFrame';

import { EditableNodeWrapper } from '@/dev/constructor/components/EditableNodeWrapper';

export type NodeViewProps = {
	id: string;
	schema: PageSchema;
	theme: ThemeTokens;

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
};

export function NodeView(props: NodeViewProps) {
	const {
		id,
		schema,
		theme,
		onDelete,
		onDuplicate,
		onSelect,
		isRoot,
		scrollContainer,
		isDragging,
		selectedId,
		handleDropAtSide,
		handleDropInside,
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

	const wrapperStyle = buildWrapperStyle(baseStyle, {
		parentLike,
		nodeType: node.type,
		editorPad: EDITOR_PAD,
	});

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
			onDuplicate={(nid) => onDuplicate(nid)}
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
							isDragging,
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
								(copyKeyRef.current ?? false) ||
								(isMac ? e.altKey : e.ctrlKey || e.altKey);
							const copy = copyIntent || copyNow;
							if (tplKey) handleDropInside(id, tplKey, undefined, { copy });
							else if (moveId)
								handleDropInside(id, undefined, moveId, { copy });
						}}
					>
						<ContainerLabel type={node.type} base={baseStyle} />

						{children.map((cid, idx) => {
							const isFill = isFillLike(schema, cid);
							const centerStyle = buildCenterStyle(axis, isFill);

							return (
								<ChildFrame
									key={cid}
									axis={axis}
									cid={cid}
									isFirst={idx === 0}
									isDragging={isDragging}
									scrollContainer={scrollContainer}
									onDropSide={(side, tpl, move, o) =>
										handleDropAtSide(cid, side, tpl, move, o)
									}
									copyKeyRef={copyKeyRef}
									isMac={isMac}
									centerStyle={centerStyle}
								>
									<NodeView
										id={cid}
										schema={schema}
										theme={theme}
										onDelete={onDelete}
										onDuplicate={onDuplicate}
										onSelect={onSelect}
										scrollContainer={scrollContainer}
										isDragging={isDragging}
										selectedId={selectedId}
										handleDropAtSide={handleDropAtSide}
										handleDropInside={handleDropInside}
										isMac={isMac}
										copyKeyRef={copyKeyRef}
									/>
								</ChildFrame>
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
