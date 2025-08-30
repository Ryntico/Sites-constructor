import type { NodeSubtree } from '@/types/siteTypes';
import { cloneSubtreeWithIds, cloneSubtreeWithIdsForAnchor } from '../schemaOps';

export function materializeTemplate(key: string, sub: NodeSubtree): NodeSubtree[] {
	if (key === 'anchor') {
		return cloneSubtreeWithIdsForAnchor(sub);
	}
	return [cloneSubtreeWithIds(sub)];
}
