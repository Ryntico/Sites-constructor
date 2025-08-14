export function stripUndefinedDeep<T>(value: T): T {
	if (value === undefined) {
		return undefined as unknown as T;
	}
	if (value === null) return value;
	if (Array.isArray(value)) {
		return value.map((v) => stripUndefinedDeep(v)) as unknown as T;
	}
	if (typeof value === 'object') {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
			if (v !== undefined) out[k] = stripUndefinedDeep(v as unknown);
		}
		return out as T;
	}
	return value;
}
