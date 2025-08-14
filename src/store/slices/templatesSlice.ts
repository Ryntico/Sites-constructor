import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '@/services/firebase/templates';
import type { BlockTemplateDoc, PageTemplateDoc } from '@/types/siteTypes.ts';
import type { RootState } from '@/store';

type State = {
	block: BlockTemplateDoc[];
	pages: PageTemplateDoc[];
	status: 'idle' | 'loading' | 'succeeded' | 'error';
	error: string | null;
};
const initialState: State = { block: [], pages: [], status: 'idle', error: null };

export const loadTemplates = createAsyncThunk('templates/loadAll', async () => {
	const [block, pages] = await Promise.all([
		api.fetchBlockTemplates(),
		api.fetchPageTemplates(),
	]);
	return { block, pages };
});

const slice = createSlice({
	name: 'templates',
	initialState,
	reducers: {},
	extraReducers: (b) => {
		b.addCase(loadTemplates.pending, (s) => {
			s.status = 'loading';
			s.error = null;
		});
		b.addCase(loadTemplates.fulfilled, (s, a) => {
			s.status = 'succeeded';
			s.block = a.payload.block;
			s.pages = a.payload.pages;
		});
		b.addCase(loadTemplates.rejected, (s, a) => {
			s.status = 'error';
			s.error = a.error?.message ?? 'load error';
		});
	},
});

export default slice.reducer;
export const selectTemplates = (st: RootState) => st.templates as State;
