import { memo, Suspense, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { routeConfig } from './routeConfig';
import { type AppRoutesProps, UserRole } from './const/types';
import { RequireNotAuth } from '@/router/RequireNotAuth.tsx';

export const AppRouter = memo(() => {

	const renderWithWrapper = useCallback((route: AppRoutesProps) => {
		const element = (
			// TODO замени на нормальную загрузку
			<Suspense fallback={<p>загрузка.....................</p>}>
				{route.element}
			</Suspense>
		);

		if (route.roles?.includes(UserRole.GUEST)) {
			return (
				<Route
					key={route.path}
					path={route.path}
					element={
						<RequireNotAuth>
							{element}
						</RequireNotAuth>}
				/>
			);
		}

		if (route.roles?.includes(UserRole.USER)) {
			return (
				<Route
					key={route.path}
					path={route.path}
					element={
						<RequireAuth roles={route.roles}>
							{element}
						</RequireAuth>
					}
				/>
			);
		}

		return (
			<Route
				key={route.path}
				path={route.path}
				element={element}
			/>
		);
	}, []);

	return <Routes>{Object.values(routeConfig).map(renderWithWrapper)}</Routes>;
});
