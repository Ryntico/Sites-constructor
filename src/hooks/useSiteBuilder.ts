import { useAppDispatch, useAppSelector } from '@store/hooks.ts';
import {
	loadSite,
	selectSite,
	setLocalSchema,
	updateTheme,
	createSiteFromTemplate,
	createPageFromTemplate,
	createEmptySite,
} from '@store/slices/siteSlice';
import { loadTemplates, selectTemplates } from '@store/slices/templatesSlice';
import type { PageSchema, SchemaPatch, ThemeTokens } from '@/types/siteTypes';
import { useEffect, useMemo, useRef } from 'react';
import { store } from '@/store';
import { DEFAULT_THEME } from '@const/defaultTheme.ts';
import { useDebounce } from '@/hooks/useDebounce';
import { hasChanges, mergePatches } from '@components/constructor/ops/schemaOps.ts';
import * as sitesApi from '@/services/firebase/sites';

export function useSiteBuilder(siteId: string, pageId: string) {
	const dispatch = useAppDispatch();
	const siteState = useAppSelector(selectSite);
	const templates = useAppSelector(selectTemplates);

	const page = siteState.pages[pageId];
	const schema = page?.schema as PageSchema | undefined;

	useEffect(() => {
		if (templates.status === 'idle') void dispatch(loadTemplates());
	}, [templates.status, dispatch]);

	useEffect(() => {
		if (siteId) void dispatch(loadSite({ siteId }));
	}, [siteId, dispatch]);

	const pendingRef = useRef<SchemaPatch>({ set: {}, del: [] });

	const { debounced: flushPatches } = useDebounce<[]>(() => {
		const patch = pendingRef.current;
		if (!hasChanges(patch)) return;
		if (!siteState.site) return;

		pendingRef.current = { set: {}, del: [] };

		void sitesApi.patchPageSchema(siteState.site.id, pageId, patch).catch((err) => {
			console.error('patchPageSchema failed', err);
		});
	}, 600);

	const listUserSites = async (ownerId: string) => {
		return await sitesApi.listUserSites(ownerId);
	};

	const listPagesOf = async (someSiteId?: string) => {
		const id = someSiteId ?? siteState.site?.id;
		if (!id) return [];
		if (!someSiteId || someSiteId === siteState.site?.id) {
			return Object.values(siteState.pages);
		}
		return await sitesApi.listPages(id);
	};

	const setSchema = (next: PageSchema, patch?: SchemaPatch) => {
		if (!siteState.site) return;

		dispatch(setLocalSchema({ siteId: siteState.site.id, pageId, schema: next }));

		if (patch && hasChanges(patch)) {
			pendingRef.current = mergePatches(pendingRef.current, patch);
			flushPatches();
		} else {
			void sitesApi
				.updatePageSchema(siteState.site.id, pageId, next)
				.catch((err) => console.error('full schema save failed', err));
		}
	};

	const setTheme = (next: ThemeTokens) => {
		if (!siteState.site) return;
		void dispatch(updateTheme({ siteId: siteState.site.id, theme: next }));
	};

	const getPageTplById = async (tplId: string) => {
		let tpl = templates.pages.find((t) => t.id === tplId);
		if (!tpl) {
			await dispatch(loadTemplates()).unwrap();
			const updated = selectTemplates(store.getState());
			tpl = updated.pages.find((t) => t.id === tplId);
		}
		if (!tpl) throw new Error(`Page template not found: ${tplId}`);
		return tpl;
	};

	const createEmptySiteId = async (opts: {
		ownerId: string | undefined;
		siteName: string;
		firstPageId: string;
		firstPageTitle: string;
		firstPageRoute?: string;
		theme?: ThemeTokens;
	}) => {
		if (!opts.ownerId) throw new Error('No ownerId');
		const themeToUse = opts.theme ?? siteState.site?.theme ?? DEFAULT_THEME;
		const res = await dispatch(
			createEmptySite({
				ownerId: opts.ownerId,
				name: opts.siteName,
				firstPageId: opts.firstPageId,
				firstPageTitle: opts.firstPageTitle,
				firstPageRoute: opts.firstPageRoute ?? '/',
				theme: themeToUse,
			}),
		).unwrap();
		return res.site.id as string;
	};

	const createSiteFromTemplateId = async (opts: {
		ownerId: string | undefined;
		name: string;
		theme?: ThemeTokens;
		templateId: string;
	}) => {
		if (!opts.ownerId) throw new Error('No ownerId');
		const tpl = await getPageTplById(opts.templateId);
		const themeToUse = opts.theme ?? siteState.site?.theme ?? DEFAULT_THEME;
		const res = await dispatch(
			createSiteFromTemplate({
				ownerId: opts.ownerId,
				name: opts.name,
				theme: themeToUse,
				pageTpl: {
					id: tpl.id,
					schema: tpl.schema,
					title: tpl.title,
					route: tpl.route,
				},
			}),
		).unwrap();
		return res.site.id as string;
	};

	const createPageFromTemplateId = async (opts: {
		pageId: string;
		templateId: string;
		title?: string;
		route?: string;
	}) => {
		if (!siteState.site) throw new Error('No siteNameEditor to create page in');
		const tpl = await getPageTplById(opts.templateId);
		await dispatch(
			createPageFromTemplate({
				siteId: siteState.site.id,
				pageId: opts.pageId,
				tpl: {
					schema: tpl.schema,
					title: opts.title ?? tpl.title,
					route: opts.route ?? tpl.route,
				},
			}),
		).unwrap();
	};

	const needsSite = siteState.status === 'succeeded' && !siteState.site;
	const needsPage =
		siteState.status === 'succeeded' &&
		Boolean(siteState.site) &&
		Object.keys(siteState.pages).length === 0;

	const loading = useMemo(
		() =>
			siteState.status !== 'succeeded' ? true : !needsSite && !needsPage && !schema,
		[siteState.status, needsSite, needsPage, schema],
	);

	return {
		loading,
		needsSite,
		needsPage,
		site: siteState.site,
		page,
		schema,
		setSchema,
		theme: siteState.site?.theme,
		setTheme,
		blockTemplates: templates.block,
		pagesTemplates: templates.pages,
		createSiteFromTemplateId,
		createPageFromTemplateId,
		createEmptySiteId,
		listUserSites,
		listPagesOf,
		pages: Object.values(siteState.pages),
	};
}
