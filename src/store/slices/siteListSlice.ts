import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import * as api from '@/services/firebase/sites';
import type { SiteDoc } from '@/types/siteTypes';
import type { RootState } from '@/store';
import { mergeArraysWithoutDuplicates } from '@/utils/arrayHelpers';

type SiteListState = {
	sites: SiteDoc[];
	status: 'idle' | 'loading' | 'succeeded' | 'error' | 'loading-more';
	error: string | null;
	pagination: {
		lastDoc?: SiteDoc | null;
		hasMore: boolean;
		pageSize: number;
	};
};

export const PAGE_SIZE = 5;

const initialState: SiteListState = {
	sites: [],
	status: 'idle',
	error: null,
	pagination: {
		lastDoc: null,
		hasMore: true,
		pageSize: PAGE_SIZE,
	},
};

export const fetchUserSites = createAsyncThunk(
	'sites/fetchUserSites',
	async (ownerId: string) => {
		return await api.listUserSites(ownerId);
	}
);

export const fetchFirstSitesPage = createAsyncThunk(
	'sites/fetchFirstSitesPage',
	async (payload: { ownerId: string; pageSize?: number }) => {
		const { ownerId, pageSize = 10 } = payload;
		return await api.listUserSitesPaginated(ownerId, pageSize);
	}
);

export const fetchNextSitesPage = createAsyncThunk(
	'sites/fetchNextSitesPage',
	async (payload: { ownerId: string }, { getState }) => {
		const state = getState() as RootState;
		const { lastDoc, pageSize } = state.siteList.pagination;

		if (!lastDoc) {
			throw new Error('No more sites to load');
		}

		return await api.listUserSitesPaginated(
			payload.ownerId,
			pageSize,
			lastDoc
		);
	},
	{
		condition: (_, { getState }) => {
			const state = getState() as RootState;
			const { status, pagination } = state.siteList;

			return status !== 'loading-more' && pagination.hasMore;
		}
	}
);

const siteListSlice = createSlice({
	name: 'siteList',
	initialState,
	reducers: {
		clearSites: (state) => {
			state.sites = [];
			state.status = 'idle';
			state.error = null;
			state.pagination = {
				lastDoc: null,
				hasMore: true,
				pageSize: 5,
			};
		},
		setPageSize: (state, action: PayloadAction<number>) => {
			state.pagination.pageSize = action.payload;
		},
		resetPagination: (state) => {
			state.pagination = {
				lastDoc: null,
				hasMore: true,
				pageSize: 5,
			};
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchUserSites.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(
				fetchUserSites.fulfilled,
				(state, action: PayloadAction<SiteDoc[]>) => {
					state.status = 'succeeded';
					state.sites = action.payload;
					state.pagination = {
						lastDoc: undefined,
						hasMore: false,
						pageSize: 5,
					};
				}
			)
			.addCase(fetchUserSites.rejected, (state, action) => {
				state.status = 'error';
				state.error = action.error.message || 'Failed to fetch sites';
			})
			.addCase(fetchFirstSitesPage.pending, (state) => {
				state.status = 'loading';
				state.pagination.hasMore = true;
			})
			.addCase(
				fetchFirstSitesPage.fulfilled,
				(state, action: PayloadAction<{ sites: SiteDoc[], lastDoc: SiteDoc | null, hasMore: boolean }>) => {
					state.status = 'succeeded';
					state.sites = action.payload.sites;
					state.pagination.lastDoc = action.payload.lastDoc;
					state.pagination.hasMore = action.payload.hasMore;
				}
			)
			.addCase(fetchFirstSitesPage.rejected, (state, action) => {
				state.status = 'error';
				state.error = action.error.message || 'Failed to fetch first page';
			})
			.addCase(fetchNextSitesPage.pending, (state) => {
				state.status = 'loading-more';
			})
			.addCase(
				fetchNextSitesPage.fulfilled,
				(state, action: PayloadAction<{ sites: SiteDoc[], lastDoc: SiteDoc | null, hasMore: boolean }>) => {
					state.status = 'succeeded';

					state.sites = mergeArraysWithoutDuplicates(state.sites, action.payload.sites);

					if (action.payload.lastDoc !== null) {
						state.pagination.lastDoc = action.payload.lastDoc;
					}
					state.pagination.hasMore = action.payload.hasMore;
				}
			)
			.addCase(fetchNextSitesPage.rejected, (state, action) => {
				state.status = 'error';
				state.error = action.error.message || 'Failed to fetch next page';
				if (action.error.message?.includes('No more sites')) {
					state.pagination.hasMore = false;
					state.status = 'succeeded';
				}
			});
	},
});

export const { clearSites, setPageSize, resetPagination } = siteListSlice.actions;

export const selectAllSites = (state: RootState) => state.siteList.sites;
export const selectSitesStatus = (state: RootState) => state.siteList.status;
export const selectSitesError = (state: RootState) => state.siteList.error;
export const selectPagination = (state: RootState) => state.siteList.pagination;
export const selectHasMoreSites = (state: RootState) => state.siteList.pagination.hasMore;
export const selectIsLoadingMore = (state: RootState) => state.siteList.status === 'loading-more';

export default siteListSlice.reducer;