import { Navigate, useLocation } from 'react-router-dom';
import { getRouteMain } from './router';
import type {ReactElement} from "react";

interface RequireAuthProps {
    children: ReactElement
}

export function RequireAuth({ children }: RequireAuthProps) {
    // TODO убрать хардкод
    const auth = true;
    const location = useLocation();


    if (!auth) {
        return <Navigate to={getRouteMain()} state={{ from: location }} replace />;
    }

    return children;
}