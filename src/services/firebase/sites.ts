import { db } from './app';
import {
	collection,
	getDocs,
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	deleteField,
	type DocumentData,
	type UpdateData,
} from 'firebase/firestore';
import type { PageDoc, PageSchema, SiteDoc, ThemeTokens } from '@/types/siteTypes';
import { stripUndefinedDeep } from '@/utils/firestoreSanitize.ts';
import { toPlain } from '@/utils/firestoreSerialize.ts';
import type { SchemaPatch } from '@/dev/constructor/runtime/schemaOps.ts';

export async function createSite(args: {
	id: string;
	ownerId: string;
	name: string;
	theme: ThemeTokens;
}) {
	const ref = doc(db, 'sites', args.id);
	const cleanArgs = stripUndefinedDeep({
		id: args.id,
		ownerId: args.ownerId,
		name: args.name,
		theme: args.theme,
	});
	await setDoc(ref, {
		...cleanArgs,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});
}

export async function getSite(siteId: string): Promise<SiteDoc | null> {
	const ref = doc(db, 'sites', siteId);
	const snap = await getDoc(ref);
	return snap.exists() ? (toPlain(snap.data()) as SiteDoc) : null;
}

export async function listPages(siteId: string): Promise<PageDoc[]> {
	const snap = await getDocs(collection(db, 'sites', siteId, 'pages'));
	return snap.docs.map((d) => toPlain(d.data()) as PageDoc);
}

export async function upsertPage(siteId: string, page: PageDoc) {
	const ref = doc(db, 'sites', siteId, 'pages', page.id);
	const cleanPage = stripUndefinedDeep(page);
	await setDoc(ref, { ...cleanPage, updatedAt: serverTimestamp() }, { merge: true });
}

export async function updatePageSchema(
	siteId: string,
	pageId: string,
	schema: PageSchema,
) {
	const ref = doc(db, 'sites', siteId, 'pages', pageId);
	const cleanSchema = stripUndefinedDeep(schema);
	await updateDoc(ref, {
		schema: cleanSchema,
		draftVersion: Date.now(),
		updatedAt: serverTimestamp(),
	});
}

export async function updateSiteTheme(siteId: string, theme: ThemeTokens): Promise<void> {
	const ref = doc(db, 'sites', siteId);
	const cleanTheme = stripUndefinedDeep(theme);

	await updateDoc(ref, {
		theme: cleanTheme,
		updatedAt: serverTimestamp(),
	});
}

export async function patchPageSchema(
	siteId: string,
	pageId: string,
	patch: SchemaPatch,
): Promise<void> {
	const ref = doc(db, 'sites', siteId, 'pages', pageId);

	// собираем объект с dot-path
	const raw: Record<string, unknown> = {
		updatedAt: serverTimestamp(),
		draftVersion: Date.now(),
	};

	for (const [p, v] of Object.entries(patch.set)) {
		raw[p] = v;
	}
	for (const p of patch.del) {
		raw[p] = deleteField();
	}

	await updateDoc(ref, raw as UpdateData<DocumentData>);
}
