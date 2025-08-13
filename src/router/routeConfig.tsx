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
} from '../const/router.ts';

// import AuthSmoke from "../dev/AuthSmoke.tsx";

const LoginPage = lazy(() =>
	import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);

const SignupPage = lazy(() =>
	import('../pages/SignupPage').then((module) => ({ default: module.SignupPage })),
);

const ProfilePage = lazy(() =>
	import('../pages/profile/ProfilePage.tsx').then((module) => ({
		default: module.ProfilePage,
	})),
);

export const routeConfig: Record<AppRoutes, AppRoutesProps> = {
	[AppRoutes.MAIN]: {
		path: getRouteMain(),
		element: <p>MAIN</p>,
	},
	[AppRoutes.LOGIN]: {
		path: getRouteLogin(),
		element: <LoginPage />,
	},
	[AppRoutes.SIGNUP]: {
		path: getRouteSignup(),
		element: <SignupPage />,
	},
	[AppRoutes.PROFILE]: {
		path: getRouteProfile(),
		element: <ProfilePage />,
		authOnly: true,
	},
	[AppRoutes.NEW_PROJECT]: {
		path: getRouteNewProject(),
		element: <p>NEW_PROJECT</p>,
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
};
