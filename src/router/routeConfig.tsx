import { lazy } from 'react';
import type { AppRoutesProps } from '../types/routerTypes.ts';

import {
	AppRoutes,
	getRouteMain,
	getRouteSignup,
	getRouteExistingProject,
	getRouteLogin,
	getRouteNewProject,
	getRouteProfile,
	getRouteConstructor,
} from '../const/router.ts';

import {UserRole} from "../types/routerTypes.ts";

const SmokeConstructorPage = lazy(() =>
	import('@pages/ConstructorPage.tsx'))

const LoginPage = lazy(() =>
	import('@pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);

const SignupPage = lazy(() =>
	import('@pages/SignupPage').then((module) => ({ default: module.SignupPage })),
);

const ProfilePage = lazy(() =>
	import('@pages/ProfilePage.tsx').then((module) => ({
		default: module.ProfilePage,
	})),
);

const MainPage = lazy(() =>
	import('@pages/MainPage.tsx').then((module) => ({
		default: module.MainPage,
	})),
);

export const routeConfig: Record<AppRoutes, AppRoutesProps> = {
	[AppRoutes.MAIN]: {
		path: getRouteMain(),
		element: <MainPage />,
		authOnly: true,
		roles: [UserRole.USER],
	},
	[AppRoutes.LOGIN]: {
		path: getRouteLogin(),
		element: <LoginPage />,
		roles: [UserRole.GUEST],
	},
	[AppRoutes.SIGNUP]: {
		path: getRouteSignup(),
		element: <SignupPage />,
		roles: [UserRole.GUEST],
	},
	[AppRoutes.PROFILE]: {
		path: getRouteProfile(),
		element: <ProfilePage />,
		authOnly: true,
		roles: [UserRole.USER],
	},
	[AppRoutes.NEW_PROJECT]: {
		path: getRouteNewProject(),
		element: <SmokeConstructorPage />,
		authOnly: true,
		roles: [UserRole.USER],
	},
	[AppRoutes.EXISTING_PROJECT]: {
		path: getRouteExistingProject(':id'),
		element: <SmokeConstructorPage />,
		authOnly: true,
		roles: [UserRole.USER],
	},
	// last
	[AppRoutes.NOT_FOUND]: {
		path: '*',
		element: <p>NOT_FOUND</p>,
		roles: [],
	},
	[AppRoutes.DEV_CONSTRUCTOR]: {
		path: getRouteConstructor(),
		element: <SmokeConstructorPage />,
		roles: [],
	},
};
