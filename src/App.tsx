import '@/App.css';
import { Header } from '@/components/Header';
import { AppRouter } from '@/router/AppRouter.tsx';
import { selectAuth } from '@store/slices/authSlice';
import { useAppSelector } from '@store/hooks';

export function App() {
	const { user, initialized } = useAppSelector(selectAuth);

	return (
		<>
			{initialized && user && <Header />}
			{initialized && <AppRouter />}
		</>
	);
}
