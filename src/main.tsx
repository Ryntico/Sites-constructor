import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { MantineProvider } from '@mantine/core';
import { BrowserRouter } from 'react-router-dom';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { Provider } from 'react-redux';
import { store } from './store';

createRoot(document.getElementById('root')!).render(
	(
		<BrowserRouter>
			<MantineProvider defaultColorScheme="auto">
				<Provider store={store}>
					<App />
				</Provider>
			</MantineProvider>
		</BrowserRouter>
	) as React.ReactNode,
);
