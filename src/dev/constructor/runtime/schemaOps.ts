import type { NodeJson, NodeSubtree, PageSchema } from './types';

export type SchemaPatch = {
	set: Record<string, unknown>;
	del: string[];
};

export const EMPTY_PATCH: SchemaPatch = { set: {}, del: [] };

export function mergePatches(a: SchemaPatch, b: SchemaPatch): SchemaPatch {
	const del = Array.from(new Set([...a.del, ...b.del]));
	return { set: { ...a.set, ...b.set }, del };
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
			childrenOrder: node.childrenOrder
				? node.childrenOrder.map((cid) => idMap.get(cid)!)
				: undefined,
		};
		outNodes[newId] = cloned;
	});
	return { rootId: idMap.get(sub.rootId)!, nodes: outNodes };
}

export function isContainer(node: NodeJson | undefined): boolean {
	if (!node) return false;
	return (
		node.type === 'page' ||
		node.type === 'section' ||
		node.type === 'box' ||
		node.type === 'row' ||
		node.type === 'list'
	);
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
		set: { [pathChildren(parentId)]: patchedParent.childrenOrder ?? [] },
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
		set[pathNode(id)] = node;
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
	const patch: SchemaPatch = { set: {}, del: [] };

	if (parentId) {
		const children = getChildren(schema, parentId).filter((id) => id !== nodeId);
		const { next: withParentUpdated, patch: p2 } = setChildren(
			schema,
			parentId,
			children,
		);
		nextSchema = withParentUpdated;
		Object.assign(patch.set, p2.set);
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
