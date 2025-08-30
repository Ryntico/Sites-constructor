import type { PageSchema, SchemaPatch } from '@/types/siteTypes';
import { cleanupSchemaBasic, mergePatches } from '../schemaOps';

export function commitWithCleanup(
	next: PageSchema,
	patch: SchemaPatch,
	onChange: (n: PageSchema, p: SchemaPatch) => void,
): void {
	const cleaned = cleanupSchemaBasic(next);
	const combined = mergePatches(patch, cleaned.patch);
	onChange(cleaned.next, combined);
}
