import type { PageSchema, SchemaPatch, NodeSubtree, Side } from '@/types/siteTypes';
import { appendSubtree, insertTemplateAtSide } from '../schemaOps';

export function appendMany(
	schema: PageSchema,
	subs: NodeSubtree[],
	parentId: string,
): { next: PageSchema; patch: SchemaPatch } {
	let cur = schema;
	let combined: SchemaPatch = { set: {}, del: [] };
	for (const s of subs) {
		const { next, patch } = appendSubtree(cur, s, parentId);
		cur = next;
		combined = {
			set: { ...combined.set, ...patch.set },
			del: [...combined.del, ...patch.del],
		};
	}
	return { next: cur, patch: combined };
}

export function insertManyAtSide(
	schema: PageSchema,
	refId: string,
	side: Side,
	subs: NodeSubtree[],
): { next: PageSchema; patch: SchemaPatch } {
	let cur = schema;
	let combined: SchemaPatch = { set: {}, del: [] };
	for (const s of subs) {
		const { next, patch } = insertTemplateAtSide(cur, refId, side, s);
		cur = next;
		combined = {
			set: { ...combined.set, ...patch.set },
			del: [...combined.del, ...patch.del],
		};
	}
	return { next: cur, patch: combined };
}
