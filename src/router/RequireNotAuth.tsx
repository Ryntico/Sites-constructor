import { Navigate, useLocation } from 'react-router-dom';
import { getRouteMain } from '@/const/router';
import type { ReactElement } from 'react';
import { selectAuth } from '@store/slices/authSlice';
import { useAppSelector } from '@store/hooks';

interface RequireNotAuthProps {
    children: ReactElement;
}

export function RequireNotAuth({ children }: RequireNotAuthProps) {
    const { user, initialized } = useAppSelector(selectAuth);
    const location = useLocation();

    if (!initialized) {
        return null;
    }

    if (user) {
        return <Navigate to={getRouteMain()} state={{ from: location }} replace />;
    }

    return children;
}
