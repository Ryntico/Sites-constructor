import type { NodeSubtree } from '@/types/siteTypes.ts';
import { cloneSubtreeWithIds, cloneSubtreeWithIdsForAnchor } from './schemaOps.ts';

export function materializeTemplate(key: string, sub: NodeSubtree): NodeSubtree[] {
	if (key === 'anchor') {
		return cloneSubtreeWithIdsForAnchor(sub);
	}
	return [cloneSubtreeWithIds(sub)];
}
