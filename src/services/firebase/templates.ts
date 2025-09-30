import { db } from './app';
import { collection, getDocs, doc, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { BlockTemplateDoc, PageTemplateDoc, PageTemplateWithThemeDoc, ThemeTokens } from '@/types/siteTypes';
import { stripUndefinedDeep } from '@/utils/firestoreSanitize.ts';

export type ThemeTemplateDoc = {
	id: string;
	name: string;
	tokens: ThemeTokens;
};

export async function fetchBlockTemplates(): Promise<BlockTemplateDoc[]> {
	const snap = await getDocs(collection(db, 'block_templates'));
	return snap.docs.map((d) => d.data() as BlockTemplateDoc);
}

export async function fetchPageTemplates(): Promise<PageTemplateDoc[]> {
	const snap = await getDocs(collection(db, 'page_templates'));
	return snap.docs.map((d) => d.data() as PageTemplateDoc)
}

export async function fetchPageTemplatesWithTheme(): Promise<PageTemplateWithThemeDoc[]> {
	const snap = await getDocs(collection(db, 'page_templates'));
	return snap.docs.map((d) =>
		({ name: d.data().name, page: d.data().page, theme: d.data().theme }));
}

export async function fetchThemeTemplates(id: string): Promise<ThemeTemplateDoc | null> {
	const ref = doc(db, 'theme_templates', id);
	const snap = await getDoc(ref);
	return snap.exists() ? (snap.data() as ThemeTemplateDoc) : null;
}

export async function savePageAsTemplate(args: {
	ownerId: string;
	name: string;
	page: PageTemplateDoc;
	theme: ThemeTokens;
}) {
	const templateRef =
		await addDoc(collection(db, 'page_templates'), {
			ownerId: args.ownerId,
			name: args.name,
			theme: stripUndefinedDeep(args.theme) || undefined,
			page: args.page,
			createAt: serverTimestamp(),
			updateAt: serverTimestamp(),
		});

	return { id: templateRef.id, ownerId: args.ownerId, name: args.name, theme: args.theme, page: args.page };
}
