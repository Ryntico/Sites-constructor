import { Navigate, useLocation } from 'react-router-dom';
import {getRouteLogin, getRouteMain} from '../const/router';
import type { ReactElement } from 'react';
import { selectAuth } from '@store/slices/authSlice';
import { useAppSelector } from '@store/hooks';
import { UserRole } from "@/types/routerTypes.ts";
import { useMemo } from "react";

interface RequireAuthProps {
	children: ReactElement;
	roles: UserRole[];
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
	const { user, initialized } = useAppSelector(selectAuth);
	const location = useLocation();

	const userRoles = useMemo(() => {
		if (!user) return [UserRole.GUEST];
		return [UserRole.USER];
	}, [user]);

	const hasRequiredRoles = useMemo(() => {
		if (!roles) {
			return true;
		}
		return roles.some((requiredRole) => {
			const hasRole = userRoles?.includes(requiredRole);
			return hasRole;
		});
	}, [roles, userRoles]);

	if (!initialized) {
		return null;
	}

	if (!user) {
		return <Navigate to={getRouteLogin()} state={{ from: location }} replace />;
	}

	if (!hasRequiredRoles) {
		return <Navigate to={getRouteMain()} state={{ from: location }} replace />;
	}

	return children;
}
