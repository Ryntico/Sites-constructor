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
	getRoutePublicPreview,
	getRouteTemplates,
} from '../const/router.ts';

import { UserRole } from '../types/routerTypes.ts';
import { NothingFoundBackground } from '@/pages/404/404.tsx';
import ConstructorPage from '@/pages/ConstructorPage.tsx';


const LoginPage = lazy(() =>
	import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
);

const SignupPage = lazy(() =>
	import('@/pages/SignupPage').then((module) => ({ default: module.SignupPage })),
);

const ProfilePage = lazy(() =>
	import('@/pages/ProfilePage.tsx').then((module) => ({
		default: module.ProfilePage,
	})),
);

const MainPage = lazy(() =>
	import('@/pages/MainPage.tsx').then((module) => ({
		default: module.MainPage,
	})),
);

const PublicPreviewPage = lazy(() => import('@pages/PublicPreview'));

const TemplatesPage = lazy(() =>
	import('@components/TemplatesCarousel.tsx').then((module) => ({
		default: module.TemplatesCarousel,
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
		element: <ConstructorPage />,
		authOnly: true,
		roles: [UserRole.USER],
	},
	[AppRoutes.EXISTING_PROJECT]: {
		path: getRouteExistingProject(':id'),
		element: <ConstructorPage />,
		authOnly: true,
		roles: [UserRole.USER],
	},
	[AppRoutes.TEMPLATES]: {
		path: getRouteTemplates(),
		element: <TemplatesPage />,
		authOnly: true,
		roles: [UserRole.USER],
	},
	[AppRoutes.PUBLIC_PREVIEW]: {
		path: getRoutePublicPreview(':siteId', ':pageId'),
		element: <PublicPreviewPage />,
		roles: [],
		hideHeader: true,
	},
	[AppRoutes.NOT_FOUND]: {
		path: '*',
		element: <NothingFoundBackground />,
		roles: [],
	}
};
