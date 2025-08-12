import { Navigate, useLocation } from 'react-router-dom';
import { getRouteLogin } from '../const/router';
import type {ReactElement} from "react";
import { selectAuth } from "../store/slices/authSlice";
import { useAppSelector } from "../store/hooks";

interface RequireAuthProps {
    children: ReactElement
}

export function RequireAuth({ children }: RequireAuthProps) {
    const {user} = useAppSelector(selectAuth);
    const location = useLocation();

    if (!user) {
        return <Navigate to={getRouteLogin()} state={{ from: location }} replace />;
    }

    return children;
}