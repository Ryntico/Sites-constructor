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
	addDoc,
	query,
	where,
	type DocumentData,
	type UpdateData,
} from 'firebase/firestore';
import type {
	PageDoc,
	PageSchema,
	SiteDoc,
	ThemeTokens,
	SchemaPatch,
} from '@/types/siteTypes';
import { stripUndefinedDeep } from '@/utils/firestoreSanitize.ts';
import { toPlain } from '@/utils/firestoreSerialize.ts';

export async function createSite(args: {
	ownerId: string;
	name: string;
	theme: ThemeTokens;
}) {
	const ref = await addDoc(collection(db, 'sites'), {
		ownerId: args.ownerId,
		name: args.name,
		theme: stripUndefinedDeep(args.theme),
		createAt: serverTimestamp(),
		updateAt: serverTimestamp(),
	});

	return { id: ref.id, ownerId: args.ownerId, name: args.name, theme: args.theme };
}

export async function getSite(siteId: string): Promise<SiteDoc | null> {
	const ref = doc(db, 'sites', siteId);
	const snap = await getDoc(ref);
	if (!snap.exists()) return null;
	const data = toPlain(snap.data()) as Omit<SiteDoc, 'id'>;
	return { id: snap.id, ...data };
}

export async function listUserSites(ownerId: string): Promise<SiteDoc[]> {
	const q = query(collection(db, 'sites'), where('ownerId', '==', ownerId));
	const snap = await getDocs(q);
	return snap.docs.map((d) => {
		const data = toPlain(d.data() as Omit<SiteDoc, 'id'>);
		return { id: d.id, ...data };
	});
}

export async function listPages(siteId: string): Promise<PageDoc[]> {
	const snap = await getDocs(collection(db, 'sites', siteId, 'pages'));
	return snap.docs.map((d) => toPlain(d.data()) as PageDoc);
}

export function makeEmptyPageSchema(): PageSchema {
	const rootId = 'nd_root';
	return {
		rootId,
		nodes: {
			[rootId]: { id: rootId, type: 'page', childrenOrder: [] },
		},
	};
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
