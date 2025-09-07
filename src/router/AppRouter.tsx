import { memo, Suspense, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { routeConfig } from './routeConfig';
import { type AppRoutesProps, UserRole } from '../types/routerTypes.ts';
import { RequireNotAuth } from '@/router/RequireNotAuth.tsx';
import { Center, Loader } from '@mantine/core';

export const AppRouter = memo(() => {

	const renderWithWrapper = useCallback((route: AppRoutesProps) => {
		const element = (
			<Suspense fallback={<Center h="100vh"><Loader /></Center>}>
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
