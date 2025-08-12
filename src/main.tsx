import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/notifications/styles.css';
import { Provider } from 'react-redux';
import { store } from './store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase/app';
import { setUser, fetchUserDoc } from './store/slices/authSlice';

onAuthStateChanged(auth, (fbUser) => {
	store.dispatch(
		setUser(
			fbUser
				? {
						uid: fbUser.uid,
						email: fbUser.email,
						displayName: fbUser.displayName,
					}
				: null,
		),
	);
	if (fbUser) {
		store.dispatch(fetchUserDoc(fbUser.uid));
	}
});

createRoot(document.getElementById('root')!).render(
	(
		<BrowserRouter>
			<MantineProvider defaultColorScheme="auto">
				<Provider store={store}>
					<Notifications />
					<App />
				</Provider>
			</MantineProvider>
		</BrowserRouter>
	) as React.ReactNode,
);
