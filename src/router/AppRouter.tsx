import { memo, Suspense, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { routeConfig } from './routeConfig';
import { type AppRoutesProps } from './const/types';

export const AppRouter = memo(() => {
	const renderWithWrapper = useCallback((route: AppRoutesProps) => {
		const element = (
			// TODO замени на нормальную загрузку
			<Suspense fallback={<p>загрузка.....................</p>}>
				{route.element}
			</Suspense>
		);

		return (
			<Route
				key={route.path}
				path={route.path}
				element={route.authOnly ? <RequireAuth>{element}</RequireAuth> : element}
			/>
		);
	}, []);

	return <Routes>{Object.values(routeConfig).map(renderWithWrapper)}</Routes>;
});
