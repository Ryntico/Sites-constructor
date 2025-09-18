import { useParams } from 'react-router-dom';
import type { PageSchema, ThemeTokens } from '@/types/siteTypes';
import { RenderTree } from '@/components/constructor/render/Renderer';
import { getSite, listPages } from '@/services/firebase/sites';
import { StyleReset } from '@/components/constructor/render/StyleReset.tsx';
import { type ReactElement, useEffect, useState } from 'react';

export default function PublicPreview(): ReactElement {
	const { siteId = '', pageId } = useParams<{ siteId: string; pageId?: string }>();

	const [state, setState] = useState<
		| { status: 'loading' }
		| { status: 'error'; message: string }
		| { status: 'ready'; theme: ThemeTokens; schema: PageSchema; title: string }
	>({ status: 'loading' });

	useEffect(() => {
		let alive = true;
		(async () => {
			try {
				const site = await getSite(siteId);
				if (!alive) return;
				if (!site) {
					setState({ status: 'error', message: 'Сайт не найден' });
					return;
				}
				const pages = await listPages(siteId);
				if (!alive) return;

				const targetPageId = pageId || 'home';
				const page = pages.find((p) => p.id === targetPageId) || pages[0];
				if (!page) {
					setState({ status: 'error', message: 'Страница не найдена' });
					return;
				}

				document.title = page.title || site.name || 'Страница';
				setState({
					status: 'ready',
					theme: site.theme,
					schema: page.schema,
					title: page.title || 'Страница',
				});
			} catch {
				if (!alive) return;
				setState({ status: 'error', message: 'Ошибка загрузки' });
			}
		})();
		return () => {
			alive = false;
		};
	}, [siteId, pageId]);

	if (state.status === 'loading') {
		return <div style={{ padding: 24, fontFamily: 'system-ui' }}>Загружаем…</div>;
	}
	if (state.status === 'error') {
		return (
			<div style={{ padding: 24, color: '#dc2626', fontFamily: 'system-ui' }}>
				{state.message}
			</div>
		);
	}

	const { theme, schema } = state;

	return (
		<div style={{ background: theme.colors.page, minHeight: '100vh' }}>
			<StyleReset theme={theme} />
			<div
				data-preview-root
				style={{
					margin: '0 auto',
					maxWidth: 1200,
					background: theme.colors.page,
					color: theme.colors.text.base,
					fontFamily:
						theme.typography?.fontFamily ??
						'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,Noto Sans',
					padding: 0,
				}}
			>
				<RenderTree schema={schema} theme={theme} />
			</div>
		</div>
	);
}
