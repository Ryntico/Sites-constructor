import { memo, Suspense, useCallback } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { routeConfig } from './routeConfig';
import { type AppRoutesProps, UserRole } from '../types/routerTypes.ts';
import { RequireNotAuth } from '@/router/RequireNotAuth.tsx';
import { Center, Loader } from '@mantine/core';
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';

export const AppRouter = memo(() => {
  const renderWithWrapper = useCallback((route: AppRoutesProps) => {
    const element = (
      <Suspense fallback={
        <Center h="100vh">
          <Loader />
        </Center>
      }>
        <ErrorBoundary>
          {route.element}
        </ErrorBoundary>
      </Suspense>
    );

    if (route.roles?.includes(UserRole.GUEST)) {
      return (
        <Route
          key={route.path}
          path={route.path}
          element={
            <RequireNotAuth>
                <ErrorBoundary>
                    {element}
                </ErrorBoundary>
            </RequireNotAuth>
          }
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
                <ErrorBoundary>
                    {element}
                </ErrorBoundary>
            </RequireAuth>
          }
        />
      );
    }

    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <ErrorBoundary>
            {element}
          </ErrorBoundary>
        }
      />
    );
  }, []);

  return (
    <ErrorBoundary>
      <Routes>{Object.values(routeConfig).map(renderWithWrapper)}</Routes>
    </ErrorBoundary>
  );
});
