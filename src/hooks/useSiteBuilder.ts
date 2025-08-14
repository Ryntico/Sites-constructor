import { useAppDispatch, useAppSelector } from '@store/hooks.ts';
import {
	loadSite,
	selectSite,
	setLocalSchema,
	updateTheme,
	createSiteFromTemplate,
	createPageFromTemplate,
} from '@store/slices/siteSlice';
import { loadTemplates, selectTemplates } from '@store/slices/templatesSlice';
import type { PageSchema, ThemeTokens } from '@/types/siteTypes';
import { useEffect, useMemo, useRef } from 'react';
import { store } from '@/store';
import { DEFAULT_THEME } from '@const/defaultTheme.ts';
import { useDebounce } from '@/hooks/useDebounce';
import type { SchemaPatch } from '@/dev/constructor/runtime/schemaOps';
import { hasChanges, mergePatches } from '@/dev/constructor/runtime/schemaOps';
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
		if (siteState.status === 'idle') void dispatch(loadSite({ siteId }));
	}, [siteState.status, siteId, dispatch]);

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

	const createSiteFromTemplateId = async (opts: {
		ownerId: string | undefined;
		name: string;
		theme?: ThemeTokens;
		templateId: string;
	}) => {
		if (!opts.ownerId) throw new Error('No ownerId');
		const tpl = await getPageTplById(opts.templateId);
		const themeToUse = opts.theme ?? siteState.site?.theme ?? DEFAULT_THEME;
		await dispatch(
			createSiteFromTemplate({
				siteId,
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
	};

	const createPageFromTemplateId = async (opts: {
		pageId: string;
		templateId: string;
		title?: string;
		route?: string;
	}) => {
		if (!siteState.site) throw new Error('No site to create page in');
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
	};
}
