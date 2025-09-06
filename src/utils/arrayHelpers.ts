export const mergeArraysWithoutDuplicates = <T extends { id: string }>(
	existing: T[],
	newItems: T[]
): T[] => {
	const merged = [...existing];
	const existingIds = new Set(existing.map(item => item.id));

	newItems.forEach(item => {
		if (!existingIds.has(item.id)) {
			merged.push(item);
			existingIds.add(item.id);
		}
	});

	return merged;
}