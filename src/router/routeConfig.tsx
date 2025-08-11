import React from "react";
import type { AppRoutesProps } from "./const/types";

import {
    AppRoutes,
    getRouteMain,
    getRouteSignup,
    getRouteExistingProject,
    getRouteLogin,
    getRouteNewProject,
    getRouteProfile,
} from '../const/router.ts'

import AuthSmoke from "../dev/AuthSmoke.tsx";


export const routeConfig: Record<AppRoutes, AppRoutesProps> = {
    [AppRoutes.MAIN]: {
        path: getRouteMain(),
        element: <p>MAIN</p>,
    },
    [AppRoutes.LOGIN]: {
        path: getRouteLogin(),
        element: <AuthSmoke />,
    },
    [AppRoutes.SIGNUP]: {
        path: getRouteSignup(),
        element: <p>SIGNUP</p>,
    },
    [AppRoutes.PROFILE]: {
        path: getRouteProfile(),
        element: <p>PROFILE</p>,
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