import type { NodeJson, NodeSubtree, PageSchema } from './types';

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

export function setChildren(schema: PageSchema, parentId: string, next: string[]) {
	const n = schema.nodes[parentId];
	if (!n) return;
	n.childrenOrder = next;
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

export function insertSubtree(
	schema: PageSchema,
	sub: NodeSubtree,
	parentId: string,
	index: number,
) {
	Object.assign(schema.nodes, sub.nodes);
	const children = getChildren(schema, parentId);
	const clamped = Math.max(0, Math.min(index, children.length));
	children.splice(clamped, 0, sub.rootId);
	setChildren(schema, parentId, children);
}

export function removeNode(schema: PageSchema, nodeId: string) {
	if (schema.rootId === nodeId) return;
	const parentId = findParentId(schema, nodeId);
	if (parentId) {
		const children = getChildren(schema, parentId).filter((id) => id !== nodeId);
		setChildren(schema, parentId, children);
	}
	const all = Array.from(collectDescendants(schema, nodeId));
	all.forEach((id) => delete schema.nodes[id]);
}

export function moveNode(
	schema: PageSchema,
	nodeId: string,
	newParentId: string,
	index: number,
) {
	if (schema.rootId === nodeId) return;
	const descendants = collectDescendants(schema, nodeId);
	if (descendants.has(newParentId)) return;

	const oldParent = findParentId(schema, nodeId);
	if (oldParent) {
		const olds = getChildren(schema, oldParent).filter((id) => id !== nodeId);
		setChildren(schema, oldParent, olds);
	}
	const next = getChildren(schema, newParentId);
	const clamped = Math.max(0, Math.min(index, next.length));
	next.splice(clamped, 0, nodeId);
	setChildren(schema, newParentId, next);
}
