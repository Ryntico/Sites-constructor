import '@/App.css';
import { Header } from '@/components/Header';
import { AppRouter } from '@/router/AppRouter.tsx';
import { selectAuth } from '@store/slices/authSlice';
import { useAppSelector } from '@store/hooks';
import { matchPath, useLocation } from 'react-router-dom';
import { routeConfig } from '@/router/routeConfig.tsx';

export function App() {
	const { user, initialized } = useAppSelector(selectAuth);
	const location = useLocation();

	const activeRoute = Object.values(routeConfig).find(
		(route) =>
			route.path && matchPath({ path: route.path, end: true }, location.pathname),
	);

	const hideHeader = activeRoute?.hideHeader;

	return (
		<>
			{initialized && user && !hideHeader && <Header />}
			{initialized && <AppRouter />}
		</>
	);
}
