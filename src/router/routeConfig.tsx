import { lazy } from 'react';
import type { AppRoutesProps } from './const/types';

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
import SmokeConstructorPage from '@/dev/SmokeConstructorPage.tsx';
import {UserRole} from "./const/types";

// import AuthSmoke from "../dev/AuthSmoke.tsx";

const LoginPage = lazy(() =>
	import('@pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);

const SignupPage = lazy(() =>
	import('@pages/SignupPage').then((module) => ({ default: module.SignupPage })),
);

const ProfilePage = lazy(() =>
	import('@pages/profile/ProfilePage').then((module) => ({
		default: module.ProfilePage,
	})),
);

const ConstructorPage = lazy(() =>
	import('@pages/constructor/ConstructorPage').then((module) => ({
		default: module.ConstructorPage,
	})),
);

const MainPage = lazy(() =>
	import('@pages/main/MainPage.tsx').then((module) => ({
		default: module.MainPage,
	})),
);

export const routeConfig: Record<AppRoutes, AppRoutesProps> = {
	[AppRoutes.MAIN]: {
		path: getRouteMain(),
		element: <MainPage />,
		authOnly: true,
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
	},
	[AppRoutes.NEW_PROJECT]: {
		path: getRouteNewProject(),
		element: <ConstructorPage />,
		authOnly: true,
	},
	[AppRoutes.EXISTING_PROJECT]: {
		path: getRouteExistingProject(':id'),
		element: <p>EXISTING_PROJECT</p>,
		authOnly: true,
	},
	// last
	[AppRoutes.NOT_FOUND]: {
		path: '*',
		element: <p>NOT_FOUND</p>,
	},
	[AppRoutes.DEV_CONSTRUCTOR]: {
		path: getRouteConstructor(),
		element: <SmokeConstructorPage />,
	},
};
