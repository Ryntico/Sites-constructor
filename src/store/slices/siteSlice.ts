import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as api from '@/services/firebase/sites';
import type {
	PageDoc,
	PageSchema,
	PageTemplateDoc,
	SiteDoc,
	ThemeTokens,
} from '@/types/siteTypes';
import type { RootState } from '@/store';

type SiteState = {
	site: SiteDoc | null;
	pages: Record<string, PageDoc>;
	status: 'idle' | 'loading' | 'succeeded' | 'error';
	error: string | null;
};

const initialState: SiteState = { site: null, pages: {}, status: 'idle', error: null };

const lsKey = (siteId: string, pageId: string) => `cache:site:${siteId}:page:${pageId}`;

export const createSiteFromTemplate = createAsyncThunk<
	{ site: SiteDoc; pages: PageDoc[] },
	{
		ownerId: string;
		name: string;
		theme: ThemeTokens;
		pageTpl: {
			id: string;
			schema: PageSchema;
			title: string;
			route: string;
		};
	}
>('sites/createFromTpl', async ({ ownerId, name, theme, pageTpl }) => {
	const site = await api.createSite({ ownerId, name, theme });
	const page: PageDoc = {
		id: 'home',
		route: pageTpl.route || '/',
		title: pageTpl.title || 'Home',
		schema: pageTpl.schema,
		draftVersion: Date.now(),
	};
	await api.upsertPage(site.id, page);
	return { site, pages: [page] };
});

export const createEmptySite = createAsyncThunk<
	{ site: SiteDoc; pages: PageDoc[] },
	{
		ownerId: string;
		name: string;
		firstPageId: string;
		firstPageTitle: string;
		firstPageRoute: string;
		theme: ThemeTokens;
	}
>('sites/createEmpty', async (args) => {
	const site = await api.createSite({
		ownerId: args.ownerId,
		name: args.name,
		theme: args.theme,
	});
	const page: PageDoc = {
		id: args.firstPageId,
		route: args.firstPageRoute || '/',
		title: args.firstPageTitle || 'Page',
		schema: api.makeEmptyPageSchema(),
		draftVersion: Date.now(),
	};
	await api.upsertPage(site.id, page);
	return { site, pages: [page] };
});

export const loadSite = createAsyncThunk(
	'sites/load',
	async ({ siteId }: { siteId: string }) => {
		const site = await api.getSite(siteId);
		const pagesArr = site ? await api.listPages(siteId) : [];
		return { site, pagesArr };
	},
);

export const createPageFromTemplate = createAsyncThunk<
	PageDoc,
	{
		siteId: string;
		pageId: string;
		tpl: Pick<PageTemplateDoc, 'schema' | 'title' | 'route'>;
	}
>('siteNameEditor/createPageFromTemplate', async ({ siteId, pageId, tpl }) => {
	const page: PageDoc = {
		id: pageId,
		route: tpl.route || '/',
		title: tpl.title || 'Page',
		schema: tpl.schema,
		draftVersion: Date.now(),
	};
	await api.upsertPage(siteId, page);
	return page;
});

export const savePageSchema = createAsyncThunk<
	{ pageId: string; schema: PageSchema },
	{ siteId: string; pageId: string; schema: PageSchema }
>('siteNameEditor/savePageSchema', async ({ siteId, pageId, schema }) => {
	await api.updatePageSchema(siteId, pageId, schema);
	return { pageId, schema };
});

export const updateTheme = createAsyncThunk<
	ThemeTokens,
	{ siteId: string; theme: ThemeTokens }
>('siteNameEditor/updateTheme', async ({ siteId, theme }) => {
	await api.updateSiteTheme(siteId, theme);
	return theme;
});

export const updateSiteName = createAsyncThunk<
  { siteId: string; name: string },
  { siteId: string; name: string },
  { rejectValue: string }
>('siteNameEditor/updateSiteName', async ({ siteId, name }, { rejectWithValue }) => {
  try {
    await api.updateSiteName(siteId, name);
    return { siteId, name };
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : 'Failed to update siteNameEditor name'
    );
  }
});

const slice = createSlice({
	name: 'site',
	initialState,
	reducers: {
		setLocalSchema(
			state,
			action: PayloadAction<{ siteId: string; pageId: string; schema: PageSchema }>,
		) {
			const { siteId, pageId, schema } = action.payload;
			const p = state.pages[pageId];
			if (p) p.schema = schema;
			localStorage.setItem(lsKey(siteId, pageId), JSON.stringify(schema));
		},
	},
	extraReducers: (b) => {
		b.addCase(loadSite.pending, (s) => {
			s.status = 'loading';
			s.error = null;
		});
		b.addCase(loadSite.fulfilled, (s, a) => {
			s.status = 'succeeded';
			s.site = a.payload.site ?? null;
			s.pages = {};
			for (const p of a.payload.pagesArr) s.pages[p.id] = p;
			if (s.site) {
				for (const p of Object.values(s.pages)) {
					const cached = localStorage.getItem(lsKey(s.site.id, p.id));
					if (cached) {
						try {
							p.schema = JSON.parse(cached);
						} catch (err) {
							console.warn('Failed to parse cached schema, drop cache', {
								pageId: p.id,
								err,
							});
						}
					}
				}
			}
		});
		b.addCase(loadSite.rejected, (s, a) => {
			s.status = 'error';
			s.error = a.error.message ?? 'load error';
		});

		b.addCase(createSiteFromTemplate.pending, (s) => {
			s.status = 'loading';
			s.error = null;
		});
		b.addCase(createSiteFromTemplate.fulfilled, (s, a) => {
			s.site = a.payload.site;
			s.pages = {};
			for (const p of a.payload.pages) s.pages[p.id] = p;
			s.status = 'succeeded';
		});
		b.addCase(createSiteFromTemplate.rejected, (s, a) => {
			s.status = 'error';
			s.error = a.error.message ?? 'create failed';
		});

		b.addCase(createEmptySite.pending, (s) => {
			s.status = 'loading';
			s.error = null;
		});
		b.addCase(createEmptySite.fulfilled, (s, a) => {
			s.site = a.payload.site;
			s.pages = {};
			for (const p of a.payload.pages) s.pages[p.id] = p;
			s.status = 'succeeded';
		});
		b.addCase(createEmptySite.rejected, (s, a) => {
			s.status = 'error';
			s.error = a.error.message ?? 'create failed';
		});

		b.addCase(createPageFromTemplate.pending, (s) => {
			s.status = 'loading';
			s.error = null;
		});
		b.addCase(createPageFromTemplate.fulfilled, (s, a) => {
			s.pages[a.payload.id] = a.payload;
			s.status = 'succeeded';
		});
		b.addCase(createPageFromTemplate.rejected, (s, a) => {
			s.status = 'error';
			s.error = a.error.message ?? 'create page failed';
		});

		b.addCase(savePageSchema.pending, (s) => {
			s.status = 'loading';
			s.error = null;
		});
		b.addCase(savePageSchema.fulfilled, (s, a) => {
			const p = s.pages[a.payload.pageId];
			if (p) p.schema = a.payload.schema;
			s.status = 'succeeded';
		});
		b.addCase(savePageSchema.rejected, (s, a) => {
			s.status = 'error';
			s.error = a.error.message ?? 'save failed';
		});

		b.addCase(updateTheme.pending, (s) => {
			s.status = 'loading';
			s.error = null;
		});
		b.addCase(updateTheme.fulfilled, (s, a) => {
			if (s.site) s.site.theme = a.payload;
			s.status = 'succeeded';
		});
		b.addCase(updateTheme.rejected, (s, a) => {
			s.status = 'error';
			s.error = a.error.message ?? 'update theme failed';
		});

		b.addCase(updateSiteName.fulfilled, (state, action) => {
			if (state.site && state.site.id === action.payload.siteId) {
				state.site.name = action.payload.name;
			}
		});
	},
});

export const { setLocalSchema } = slice.actions;
export default slice.reducer;

export const selectSite = (st: RootState) => st.site as SiteState;
