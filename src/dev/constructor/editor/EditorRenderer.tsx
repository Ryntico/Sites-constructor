import React, { useEffect, useRef, useState } from 'react';
import type {
	PageSchema,
	ThemeTokens,
	NodeSubtree,
	SchemaPatch,
	Side,
} from '@/types/siteTypes';
import {
	removeNode,
	insertTemplateAtSide,
	moveNodeToSide,
	appendSubtree,
	moveNodeInto,
	extractSubtree,
	duplicateNode,
	cloneSubtreeWithIds,
} from '@/dev/constructor/ops/schemaOps.ts';

import { IS_MAC } from '@/dev/constructor/runtime/dnd/constants';
import { useCopyKey } from '@/dev/constructor/runtime/hooks/useCopyKey';
import { commitWithCleanup } from '@/dev/constructor/ops/commit';
import { materializeTemplate } from '@/dev/constructor/ops/materializeTemplate';
import { appendMany, insertManyAtSide } from '@/dev/constructor/ops/insertions';
import { acceptsDt } from '@/dev/constructor/runtime/dnd/utils';
import { NodeView } from '@/dev/constructor/editor/NodeView';

import '@/dev/constructor/styles/editorBase.css';

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
			data-testid="editor-root"
			onDragEnter={onRootDragEnter}
			onDragOver={onRootDragOver}
			onDragLeave={onRootDragLeave}
			onDrop={onRootDrop}
			onClickCapture={onEditorClickCapture}
		>
			<NodeView
				id={schema.rootId}
				schema={schema}
				theme={theme}
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
