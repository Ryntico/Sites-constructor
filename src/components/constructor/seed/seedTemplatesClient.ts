import { writeBatch, collection, doc } from 'firebase/firestore';
import { db } from '@/services/firebase/app.ts';
import { BLOCK_TEMPLATES } from '@/components/constructor/palette/blockTemplates.ts';
import { pageMock } from '@/components/constructor/mocks/page.mock.ts';
import { themeMock } from '@/components/constructor/mocks/theme.mock.ts';

export async function seedTemplatesClient() {
	const batch = writeBatch(db);

	for (const t of BLOCK_TEMPLATES) {
		const ref = doc(collection(db, 'block_templates'), t.id);
		batch.set(ref, {
			id: t.id,
			name: t.name,
			previewImage: t.previewImage ?? null,
			schema: t.schema,
		});
	}

	batch.set(doc(collection(db, 'page_templates'), 'base-smoke'), {
		id: 'base-smoke',
		name: 'Base Smoke',
		title: pageMock.title,
		route: pageMock.route,
		schema: pageMock.schema,
	});

	batch.set(doc(collection(db, 'theme_templates'), 'theme-default'), {
		id: 'theme-default',
		name: 'Default (Smoke)',
		tokens: themeMock,
	});

	await batch.commit();
}
