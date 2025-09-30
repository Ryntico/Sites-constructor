import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/services/firebase/templates';
import type { BlockTemplateDoc, PageTemplateDoc, PageTemplateWithThemeDoc, ThemeTokens } from '@/types/siteTypes.ts';
import type { RootState } from '@/store';

type State = {
	block: BlockTemplateDoc[];
	pagesWithThemes: PageTemplateWithThemeDoc[];
	status: 'idle' | 'loading' | 'succeeded' | 'error';
	saveStatus: 'idle' | 'saving' | 'succeeded' | 'error';
	error: string | null;
};

const initialState: State = {
	block: [],
	pagesWithThemes: [],
	status: 'idle',
	saveStatus: 'idle',
	error: null,
};

export const loadTemplates = createAsyncThunk('templates/loadAll', async () => {
	const [block, pagesWithThemes] = await Promise.all([
		api.fetchBlockTemplates(),
		api.fetchPageTemplatesWithTheme(),
	]);
	return { block, pagesWithThemes };
});

export const savePageAsTemplate = createAsyncThunk(
	'templates/savePageAsTemplate',
	async (args: { page: PageTemplateDoc, ownerId: string, name: string, theme: ThemeTokens }) => {
		return await api.savePageAsTemplate(args);
	},
);

const slice = createSlice({
	name: 'templates',
	initialState,
	reducers: {
		resetSaveStatus: (state) => {
			state.saveStatus = 'idle';
			state.error = null;
		},
	},
	extraReducers: (b) => {
		b.addCase(loadTemplates.pending, (s) => {
			s.status = 'loading';
			s.error = null;
		});
		b.addCase(loadTemplates.fulfilled, (s, a) => {
			s.status = 'succeeded';
			s.block = a.payload.block;
			s.pagesWithThemes = a.payload.pagesWithThemes;
		});
		b.addCase(loadTemplates.rejected, (s, a) => {
			s.status = 'error';
			s.error = a.error?.message ?? 'Failed to load templates';
		});
		b.addCase(savePageAsTemplate.pending, (s) => {
			s.saveStatus = 'saving';
			s.error = null;
		});
		b.addCase(savePageAsTemplate.fulfilled, (s, a) => {
			s.saveStatus = 'succeeded';
			s.pagesWithThemes.unshift({ name: a.payload.name, page: a.payload.page, theme: a.payload.theme });
		});
		b.addCase(savePageAsTemplate.rejected, (s, a) => {
			s.saveStatus = 'error';
			s.error = a.error?.message ?? 'Failed to save template';
		});
	},
});

export default slice.reducer;
export const selectTemplates = (st: RootState) => st.templates as State;
