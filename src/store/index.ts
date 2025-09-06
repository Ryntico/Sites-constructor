import { configureStore } from '@reduxjs/toolkit';
import auth from './slices/authSlice';
import site from './slices/siteSlice';
import templates from './slices/templatesSlice';
import siteList from './slices/siteListSlice';

export const store = configureStore({
	reducer: {
		auth,
		site,
		templates,
		siteList
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
