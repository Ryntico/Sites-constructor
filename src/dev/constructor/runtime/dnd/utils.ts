export function typesToArray(types: DataTransfer['types']): string[] {
	const maybeIterable = types as unknown as { [Symbol.iterator]?: unknown };
	if (typeof maybeIterable[Symbol.iterator] === 'function') {
		return Array.from(types as unknown as Iterable<string>);
	}
	const list = types as unknown as { length: number; item(i: number): string | null };
	const out: string[] = [];
	for (let i = 0; i < list.length; i++) {
		const v = list.item(i);
		if (v) out.push(v);
	}
	return out;
}

export function isCopyKeyLike(
	k: { altKey: boolean; metaKey: boolean; ctrlKey: boolean },
	isMac: boolean,
): boolean {
	return isMac ? k.metaKey || k.altKey : k.ctrlKey || k.altKey;
}

export function accepts(types: DataTransfer['types'], ...allowed: string[]) {
	const arr = typesToArray(types);
	return allowed.some((t) => arr.includes(t));
}
