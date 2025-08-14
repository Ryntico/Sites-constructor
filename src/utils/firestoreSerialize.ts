import { Timestamp } from 'firebase/firestore';

export function toPlain<T>(val: T): T {
	if (val instanceof Timestamp) return val.toMillis() as unknown as T;

	if (Array.isArray(val)) {
		const arr = (val as unknown as unknown[]).map((v) => toPlain(v));
		return arr as unknown as T;
	}

	if (val && typeof val === 'object') {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
			out[k] = toPlain(v);
		}
		return out as unknown as T;
	}

	return val;
}
