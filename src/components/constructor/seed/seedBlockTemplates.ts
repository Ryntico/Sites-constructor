import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/services/firebase/app.ts';
import { BLOCK_TEMPLATES } from '@/components/constructor/palette/blockTemplates.ts';

export type SeedResult = { created: number; updated: number; archived: number };

type FireBlockTemplateDoc = {
	id: string;
	name: string;
	previewImage: string | null;
	schema: unknown;
	schemaHash: string;
	version: number;
	updatedAt: number;
	source: 'seed' | 'ui';
	archived?: boolean;
};

function stableStringify(value: unknown): string {
	const seen = new WeakSet<object>();
	const walk = (v: unknown): unknown => {
		if (v && typeof v === 'object') {
			if (seen.has(v as object)) return null;
			seen.add(v as object);

			if (Array.isArray(v)) return v.map(walk);

			const o = v as Record<string, unknown>;
			const out: Record<string, unknown> = {};
			for (const k of Object.keys(o).sort()) out[k] = walk(o[k]);
			return out;
		}
		return v;
	};
	return JSON.stringify(walk(value));
}

function hash32(str: string): string {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (h << 5) - h + str.charCodeAt(i);
		h |= 0;
	}
	return (h >>> 0).toString(16).padStart(8, '0');
}

function schemaHash(payload: unknown): string {
	return hash32(stableStringify(payload));
}

/**
 * Синхронизирует только BLOCK_TEMPLATES → коллекция `block_templates`.
 * @param opts.archiveMissing если true — помечает отсутствующие в коде шаблоны archived=true
 */
export async function seedBlockTemplates(
	opts: { archiveMissing?: boolean } = {},
): Promise<SeedResult> {
	const now = Date.now();
	const col = collection(db, 'block_templates');

	const existing = new Map<string, FireBlockTemplateDoc>();
	const snap = await getDocs(col);
	snap.forEach((d) => existing.set(d.id, d.data() as FireBlockTemplateDoc));

	const codeIds = new Set<string>(BLOCK_TEMPLATES.map((t) => t.id));

	let batch = writeBatch(db);
	let pending = 0;
	const flush = async () => {
		if (pending > 0) {
			await batch.commit();
			batch = writeBatch(db);
			pending = 0;
		}
	};
	const queueSet = (
		ref: ReturnType<typeof doc>,
		data: Partial<FireBlockTemplateDoc>,
	) => {
		batch.set(ref, data, { merge: true });
		pending++;
		if (pending >= 400) void flush();
	};

	let created = 0;
	let updated = 0;
	let archived = 0;

	for (const t of BLOCK_TEMPLATES) {
		// const id = t.key;
		const id = t.id;
		const ref = doc(col, id);
		const prev = existing.get(id);

		const payloadForHash = {
			name: t.name,
			previewImage: t.previewImage ?? null,
			schema: t.schema,
		};
		const hash = schemaHash(payloadForHash);

		const next: Partial<FireBlockTemplateDoc> = {
			id,
			name: t.name,
			previewImage: t.previewImage ?? null,
			schema: t.schema,
			schemaHash: hash,
			version:
				prev?.schemaHash === hash
					? (prev.version ?? 1)
					: (prev?.version ?? 0) + 1,
			updatedAt: now,
			source: 'seed',
			archived: false,
		};

		if (!prev) {
			queueSet(ref, next);
			created++;
		} else if (prev.schemaHash !== hash || prev.archived) {
			queueSet(ref, next);
			updated++;
		}
	}

	if (opts.archiveMissing) {
		for (const [id, docVal] of existing) {
			if (!codeIds.has(id) && !docVal.archived) {
				const ref = doc(col, id);
				queueSet(ref, { archived: true, updatedAt: now });
				archived++;
			}
		}
	}

	await flush();
	return { created, updated, archived };
}
