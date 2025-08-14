import { db } from './app';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import type { BlockTemplateDoc, PageTemplateDoc, ThemeTokens } from '@/types/siteTypes';

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
	return snap.docs.map((d) => d.data() as PageTemplateDoc);
}

export async function fetchThemeTemplates(id: string): Promise<ThemeTemplateDoc | null> {
	const ref = doc(db, 'theme_templates', id);
	const snap = await getDoc(ref);
	return snap.exists() ? (snap.data() as ThemeTemplateDoc) : null;
}
