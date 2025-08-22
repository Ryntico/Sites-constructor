import type {
	Axis,
	NodeJson,
	NodeSubtree,
	PageSchema,
	SchemaPatch,
	Side,
} from '@/types/siteTypes.ts';

export const EMPTY_PATCH: SchemaPatch = { set: {}, del: [] };

export function mergePatches(a: SchemaPatch, b: SchemaPatch): SchemaPatch {
	const del = Array.from(new Set([...(a.del || []), ...(b.del || [])]));
	return { set: { ...(a.set || {}), ...(b.set || {}) }, del };
}

export function hasChanges(p: SchemaPatch): boolean {
	return Object.keys(p.set).length > 0 || p.del.length > 0;
}

function pathChildren(parentId: string) {
	return `schema.nodes.${parentId}.childrenOrder`;
}
function pathNode(nodeId: string) {
	return `schema.nodes.${nodeId}`;
}

function stripUndefinedDeep<T>(v: T): T {
	if (v === null || typeof v !== 'object') return v;
	if (Array.isArray(v)) {
		return v
			.filter((x) => x !== undefined)
			.map((x) => stripUndefinedDeep(x)) as unknown as T;
	}
	const out: Record<string, unknown> = {};
	for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
		if (val === undefined) continue;
		out[k] = stripUndefinedDeep(val as unknown);
	}
	return out as T;
}

function cleanNodeForPatch(node: NodeJson): NodeJson {
	return {
		id: node.id,
		type: node.type,
		...(node.props !== undefined ? { props: stripUndefinedDeep(node.props) } : {}),
		...(node.childrenOrder !== undefined
			? { childrenOrder: [...node.childrenOrder] }
			: {}),
	};
}

export function genId(prefix = 'n'): string {
	return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function cloneSubtreeWithIds(sub: NodeSubtree): NodeSubtree {
	const idMap = new Map<string, string>();
	const outNodes: Record<string, NodeJson> = {};

	Object.keys(sub.nodes).forEach((oldId) => idMap.set(oldId, genId('nd')));

	Object.entries(sub.nodes).forEach(([oldId, node]) => {
		const newId = idMap.get(oldId)!;
		const cloned: NodeJson = {
			...node,
			id: newId,
		};
		if (node.childrenOrder && node.childrenOrder.length) {
			cloned.childrenOrder = node.childrenOrder.map((cid) => idMap.get(cid)!);
		}
		outNodes[newId] = cloned;
	});

	return { rootId: idMap.get(sub.rootId)!, nodes: outNodes };
}

export function isContainer(node: NodeJson | undefined): boolean {
	if (!node) return false;
	return ['page', 'section', 'box', 'row', 'form'].includes(node.type)
}

export function getChildren(schema: PageSchema, parentId: string): string[] {
	const n = schema.nodes[parentId];
	return n?.childrenOrder ?? [];
}

export function findParentId(schema: PageSchema, childId: string): string | null {
	for (const [id, node] of Object.entries(schema.nodes)) {
		if (node.childrenOrder?.includes(childId)) return id;
	}
	return null;
}

export function collectDescendants(
	schema: PageSchema,
	nodeId: string,
	acc = new Set<string>(),
) {
	const node = schema.nodes[nodeId];
	if (!node) return acc;
	acc.add(nodeId);
	(node.childrenOrder ?? []).forEach((cid) => collectDescendants(schema, cid, acc));
	return acc;
}

export function setChildren(
	schema: PageSchema,
	parentId: string,
	next: string[],
): { next: PageSchema; patch: SchemaPatch } {
	const n = schema.nodes[parentId];
	if (!n) return { next: schema, patch: EMPTY_PATCH };

	const patchedParent: NodeJson = { ...n, childrenOrder: [...next] };
	const nextSchema: PageSchema = {
		...schema,
		nodes: { ...schema.nodes, [parentId]: patchedParent },
	};

	const patch: SchemaPatch = {
		set: { [pathChildren(parentId)]: patchedParent.childrenOrder },
		del: [],
	};
	return { next: nextSchema, patch };
}

export function insertSubtree(
	schema: PageSchema,
	sub: NodeSubtree,
	parentId: string,
	index: number,
): { next: PageSchema; patch: SchemaPatch } {
	const parent = schema.nodes[parentId];
	if (!parent) return { next: schema, patch: EMPTY_PATCH };

	const children = getChildren(schema, parentId);
	const clamped = Math.max(0, Math.min(index, children.length));
	const newChildren = [...children];
	newChildren.splice(clamped, 0, sub.rootId);

	const nextNodes = { ...schema.nodes, ...sub.nodes };
	const nextSchema: PageSchema = {
		...schema,
		nodes: {
			...nextNodes,
			[parentId]: { ...parent, childrenOrder: newChildren },
		},
	};

	const set: Record<string, unknown> = {
		[pathChildren(parentId)]: newChildren,
	};
	for (const [id, node] of Object.entries(sub.nodes)) {
		set[pathNode(id)] = cleanNodeForPatch(node);
	}

	return { next: nextSchema, patch: { set, del: [] } };
}

export function removeNode(
	schema: PageSchema,
	nodeId: string,
): { next: PageSchema; patch: SchemaPatch } {
	if (schema.rootId === nodeId) return { next: schema, patch: EMPTY_PATCH };

	const parentId = findParentId(schema, nodeId);
	let nextSchema: PageSchema = schema;
	let patch: SchemaPatch = { set: {}, del: [] };

	if (parentId) {
		const children = getChildren(schema, parentId).filter((id) => id !== nodeId);
		const res = setChildren(nextSchema, parentId, children);
		nextSchema = res.next;
		patch = mergePatches(patch, res.patch);
	}

	const toDelete = Array.from(collectDescendants(nextSchema, nodeId));
	const nextNodes = { ...nextSchema.nodes };
	for (const id of toDelete) {
		delete nextNodes[id];
		patch.del.push(pathNode(id));
	}
	nextSchema = { ...nextSchema, nodes: nextNodes };

	return { next: nextSchema, patch };
}

export function moveNode(
	schema: PageSchema,
	nodeId: string,
	newParentId: string,
	targetIndex: number,
): { next: PageSchema; patch: SchemaPatch } {
	if (schema.rootId === nodeId) return { next: schema, patch: EMPTY_PATCH };

	const descendants = collectDescendants(schema, nodeId);
	if (descendants.has(newParentId)) return { next: schema, patch: EMPTY_PATCH };

	const oldParentId = findParentId(schema, nodeId);
	if (!oldParentId) return { next: schema, patch: EMPTY_PATCH };

	let cur = schema;
	let patch = EMPTY_PATCH;

	const oldChildren = getChildren(cur, oldParentId);
	const fromIndex = oldChildren.indexOf(nodeId);
	if (fromIndex < 0) return { next: schema, patch: EMPTY_PATCH };

	const removed = oldChildren.filter((id) => id !== nodeId);
	const res1 = setChildren(cur, oldParentId, removed);
	cur = res1.next;
	patch = mergePatches(patch, res1.patch);

	const sameParent = oldParentId === newParentId;
	const baseNewChildren = sameParent ? removed : getChildren(cur, newParentId);

	let insertIndex = Math.max(0, Math.min(targetIndex, baseNewChildren.length));
	if (sameParent && fromIndex < targetIndex) {
		insertIndex = Math.max(0, Math.min(baseNewChildren.length, targetIndex - 1));
	}

	const inserted = [
		...baseNewChildren.slice(0, insertIndex),
		nodeId,
		...baseNewChildren.slice(insertIndex),
	];

	const res2 = setChildren(cur, newParentId, inserted);
	cur = res2.next;
	patch = mergePatches(patch, res2.patch);

	return { next: cur, patch };
}

export function containerAxisOf(node: NodeJson): Axis {
	type Display = string | undefined;
	type FlexDirection =
		| 'row'
		| 'row-reverse'
		| 'column'
		| 'column-reverse'
		| string
		| undefined;

	const base = node.props?.style?.base as
		| { display?: Display; flexDirection?: FlexDirection }
		| undefined;
	const disp = base?.display;
	const fd = base?.flexDirection;

	if (disp === 'flex' || disp === 'inline-flex') {
		return fd === 'column' || fd === 'column-reverse' ? 'y' : 'x';
	}
	return node.type === 'row' ? 'x' : 'y';
}

function createWrapper(axis: Axis): NodeJson {
	const id = genId(axis === 'x' ? 'row' : 'box');
	const type: NodeJson['type'] = axis === 'x' ? 'row' : 'box';
	const props: NonNullable<NodeJson['props']> = { style: { base: {} } };

	if (axis === 'x') {
		props.style!.base = { ...props.style!.base, display: 'flex' };
	} else {
		props.style!.base = {
			...props.style!.base,
			display: 'flex',
			flexDirection: 'column',
		};
	}
	return { id, type, props, childrenOrder: [] };
}

export function insertTemplateAtSide(
	schema: PageSchema,
	refId: string,
	side: Side,
	sub: NodeSubtree,
): { next: PageSchema; patch: SchemaPatch } {
	const parentId = findParentId(schema, refId);
	if (!parentId) return { next: schema, patch: EMPTY_PATCH };

	const cloned = cloneSubtreeWithIds(sub);

	const desiredAxis: Axis = side === 'left' || side === 'right' ? 'x' : 'y';
	const parent = schema.nodes[parentId]!;
	const parentAxis = containerAxisOf(parent);

	const refIndex = getChildren(schema, parentId).indexOf(refId);
	if (refIndex < 0) return { next: schema, patch: EMPTY_PATCH };

	if (parentAxis === desiredAxis) {
		const insertIndex = side === 'left' || side === 'top' ? refIndex : refIndex + 1;
		return insertSubtree(schema, cloned, parentId, insertIndex);
	}

	const wrapper = createWrapper(desiredAxis);

	const parentChildren = [...getChildren(schema, parentId)];
	const pos = parentChildren.indexOf(refId);
	parentChildren.splice(pos, 1, wrapper.id);

	const wrapChildren =
		side === 'left' || side === 'top'
			? [cloned.rootId, refId]
			: [refId, cloned.rootId];

	const nextNodes = {
		...schema.nodes,
		...cloned.nodes,
		[wrapper.id]: { ...wrapper, childrenOrder: wrapChildren },
	};
	const next: PageSchema = {
		...schema,
		nodes: {
			...nextNodes,
			[parentId]: { ...parent, childrenOrder: parentChildren },
		},
	};

	const set: Record<string, unknown> = {
		[pathChildren(parentId)]: parentChildren,
		[pathNode(wrapper.id)]: cleanNodeForPatch(nextNodes[wrapper.id]),
	};
	for (const [nid, n] of Object.entries(cloned.nodes)) {
		set[pathNode(nid)] = cleanNodeForPatch(n);
	}

	return { next, patch: { set, del: [] } };
}

export function moveNodeToSide(
	schema: PageSchema,
	refId: string,
	side: Side,
	movingId: string,
): { next: PageSchema; patch: SchemaPatch } {
	if (refId === movingId) return { next: schema, patch: EMPTY_PATCH };

	const parentId = findParentId(schema, refId);
	if (!parentId) return { next: schema, patch: EMPTY_PATCH };

	const desiredAxis: Axis = side === 'left' || side === 'right' ? 'x' : 'y';
	const parent = schema.nodes[parentId]!;
	const parentAxis = containerAxisOf(parent);

	const refIndex = getChildren(schema, parentId).indexOf(refId);
	if (refIndex < 0) return { next: schema, patch: EMPTY_PATCH };

	if (parentAxis === desiredAxis) {
		const insertIndex = side === 'left' || side === 'top' ? refIndex : refIndex + 1;
		return moveNode(schema, movingId, parentId, insertIndex);
	}

	const wrapper = createWrapper(desiredAxis);

	let cur = schema;
	let outPatch = EMPTY_PATCH;

	const oldParentId = findParentId(cur, movingId);
	if (oldParentId) {
		const oldChildren = getChildren(cur, oldParentId).filter((id) => id !== movingId);
		const res = setChildren(cur, oldParentId, oldChildren);
		cur = res.next;
		outPatch = mergePatches(outPatch, res.patch);
	}

	const wrapChildren =
		side === 'left' || side === 'top' ? [movingId, refId] : [refId, movingId];

	const parentChildren = [...getChildren(cur, parentId)];
	const pos = parentChildren.indexOf(refId);
	parentChildren.splice(pos, 1, wrapper.id);

	const wrapperNode: NodeJson = { ...wrapper, childrenOrder: wrapChildren };
	const nextNodes = { ...cur.nodes, [wrapper.id]: wrapperNode };
	cur = { ...cur, nodes: nextNodes };

	const set: Record<string, unknown> = {
		[pathNode(wrapper.id)]: cleanNodeForPatch(wrapperNode),
	};
	const resParent = setChildren(cur, parentId, parentChildren);
	cur = resParent.next;
	outPatch = mergePatches(outPatch, { set, del: [] });
	outPatch = mergePatches(outPatch, resParent.patch);

	return { next: cur, patch: outPatch };
}

export function appendSubtree(
	schema: PageSchema,
	sub: NodeSubtree,
	parentId: string,
): { next: PageSchema; patch: SchemaPatch } {
	const children = getChildren(schema, parentId);
	return insertSubtree(schema, sub, parentId, children.length);
}

export function moveNodeInto(
	schema: PageSchema,
	movingId: string,
	parentId: string,
): { next: PageSchema; patch: SchemaPatch } {
	const children = getChildren(schema, parentId);
	return moveNode(schema, movingId, parentId, children.length);
}
