import React, { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { exportPageToHtml } from './runtime/Renderer';
import { cleanupManualEmptyContainers, cloneSubtreeWithIds } from './runtime/schemaOps';
import { EditorRenderer } from './runtime/EditorRenderer';
import { Inspector } from './Inspector';
import { Palette } from './palette/Palette';
import { PreviewPane } from '../preview/PreviewPane';
import { ThemeEditor } from '../theme/ThemeEditor';
import { useSiteBuilder } from '@/hooks/useSiteBuilder';
import { useAppSelector } from '@store/hooks.ts';
import { selectAuth } from '@store/slices/authSlice.ts';
import { SeedBlockTemplatesButton } from '@/dev/seed/SeedBlockTemplatesButton.tsx';
import type { NodeSubtree, PageSchema, SchemaPatch } from '@/types/siteTypes.ts';
import {
	canRedo,
	canUndo,
	type HistoryState,
	loadHistory,
	pushHistory,
	redo,
	saveHistory,
	undo,
} from '@/dev/constructor/runtime/history.ts';
import CodePreviewModal from '@/dev/constructor/components/CodePreviewModal.tsx';

function download(filename: string, content: string, mime = 'text/html') {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function openFullPreview(html: string) {
	const blob = new Blob([html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	window.open(url, '_blank', 'noopener,noreferrer');
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function SmokeConstructor() {
	const [siteId, setSiteId] = useState<string | null>(
		localStorage.getItem('currentSiteId'),
	);

	const {
		loading,
		site,
		page,
		schema,
		setSchema,
		theme,
		setTheme,
		blockTemplates,
		needsSite,
		needsPage,
		createSiteFromTemplateId,
		createPageFromTemplateId,
		createEmptySiteId,
		listUserSites,
	} = useSiteBuilder(siteId ?? '', 'home');

	const { user } = useAppSelector(selectAuth);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [mode, setMode] = useState<'edit' | 'preview'>('edit');
	const [rightTab, setRightTab] = useState<'inspector' | 'theme'>('inspector');
	const [showCode, setShowCode] = useState(false);

	const historyKey = `hist:${siteId ?? 'no-site'}:${page?.id ?? 'no-page'}`;

	const historyRef = useRef<HistoryState>(loadHistory(historyKey));
	const applyingFromHistoryRef = useRef(false);
	const [, forceRender] = useState(0);
	const undoRef = useRef<() => void>(() => {});
	const redoRef = useRef<() => void>(() => {});

	useEffect(() => {
		undoRef.current = handleUndo;
		redoRef.current = handleRedo;
	});

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const mod = e.metaKey || e.ctrlKey;
			if (!mod) return;

			const key = e.key.toLowerCase();

			if (key === 'z' && !e.shiftKey) {
				e.preventDefault();
				undoRef.current();
			} else if ((key === 'z' && e.shiftKey) || key === 'y') {
				e.preventDefault();
				redoRef.current();
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	useEffect(() => {
		historyRef.current = loadHistory(historyKey);
		saveHistory(historyKey, historyRef.current);
		forceRender((x) => x + 1);
	}, [historyKey]);

	function applySchemaChange(next: PageSchema, patch?: SchemaPatch) {
		if (!applyingFromHistoryRef.current && schema) {
			historyRef.current = pushHistory(historyRef.current, schema);
			saveHistory(historyKey, historyRef.current);
			forceRender((x) => x + 1);
		}
		setSchema(next, patch);
	}

	function handleUndo() {
		if (!schema) return;
		const res = undo(historyRef.current, schema);
		if (!res.schema) return;
		historyRef.current = res.state;
		saveHistory(historyKey, historyRef.current);
		applyingFromHistoryRef.current = true;
		setSchema(res.schema);
		applyingFromHistoryRef.current = false;
		forceRender((x) => x + 1);
		if (!res.schema.nodes[selectedId ?? '']) setSelectedId(null);
	}

	function handleRedo() {
		if (!schema) return;
		const res = redo(historyRef.current, schema);
		if (!res.schema) return;
		historyRef.current = res.state;
		saveHistory(historyKey, historyRef.current);
		applyingFromHistoryRef.current = true;
		setSchema(res.schema);
		applyingFromHistoryRef.current = false;
		forceRender((x) => x + 1);
		if (!res.schema.nodes[selectedId ?? '']) setSelectedId(null);
	}

	useEffect(() => {
		if (!user?.uid || siteId) return;
		listUserSites(user.uid).then((sites) => {
			if (sites.length) {
				const id = sites[0].id;
				setSiteId(id);
				localStorage.setItem('currentSiteId', id);
			}
		});
	}, [user?.uid, siteId, listUserSites]);

	const exported = useMemo(() => {
		if (!schema || !theme) return '';
		return exportPageToHtml({
			title: page?.title || site?.name || 'Untitled',
			schema,
			theme,
		});
	}, [schema, theme, page?.title, site?.name]);

	const resolveTemplate = (id: string): NodeSubtree | null => {
		const tpl = blockTemplates.find((t) => t.id === id);
		return tpl ? cloneSubtreeWithIds(tpl.schema) : null;
	};

	const canvasRef = useRef<HTMLDivElement>(null);

	if (!siteId || needsSite) {
		return (
			<div style={{ padding: 24 }}>
				<h3>Сайтов нет</h3>
				<button
					style={btn}
					onClick={async () => {
						const newId = await createEmptySiteId({
							ownerId: user?.uid,
							siteName: 'Мой сайт',
							firstPageId: 'home',
							firstPageTitle: 'Home',
							firstPageRoute: '/',
						});
						setSiteId(newId);
						localStorage.setItem('currentSiteId', newId);
					}}
				>
					Создать сайт
				</button>
				<button
					style={btn}
					onClick={() =>
						createSiteFromTemplateId({
							ownerId: user?.uid,
							name: 'Demo site',
							templateId: 'base-smoke',
						})
					}
				>
					Создать сайт из base-smoke
				</button>
			</div>
		);
	}

	if (needsPage) {
		return (
			<div style={{ padding: 24 }}>
				<h3>Нет страниц</h3>
				<button
					style={btn}
					onClick={() =>
						createPageFromTemplateId({
							pageId: 'home',
							templateId: 'base-smoke',
							title: 'Home',
							route: '/',
						})
					}
				>
					Создать страницу из base-smoke
				</button>
			</div>
		);
	}

	return (
		<div style={{ display: 'grid', gap: 16, padding: 16 }}>
			<div
				style={{
					border: '1px solid #e6e8ef',
					borderRadius: 12,
					overflow: 'hidden',
					background: '#fff',
				}}
			>
				<div
					style={{
						padding: 12,
						borderBottom: '1px solid #e6e8ef',
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						gap: 12,
						flexWrap: 'wrap',
					}}
				>
					<strong>Конструктор (Smoke) — DnD</strong>
					<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
						<button
							onClick={() => setShowCode(true)}
							style={btn}
							disabled={!exported}
							title={
								!exported ? 'Данные ещё грузятся…' : 'Показать HTML-код'
							}
						>
							Посмотреть код
						</button>
						<button
							onClick={() =>
								exported && download('page-export.html', exported)
							}
							style={btn}
							disabled={!exported}
							title={!exported ? 'Данные ещё грузятся…' : 'Скачать HTML'}
						>
							Экспорт HTML
						</button>
						<button
							onClick={() => exported && openFullPreview(exported)}
							style={btn}
							disabled={!exported}
							title={!exported ? 'Данные ещё грузятся…' : 'Открыть превью'}
						>
							Полный предпросмотр
						</button>
					</div>
				</div>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'auto 1fr 360px',
						gap: 16,
						padding: 16,
						alignItems: 'start',
					}}
				>
					<Palette
						items={blockTemplates.map((b) => ({ id: b.id, name: b.name }))}
					/>
					<div
						ref={canvasRef}
						style={{
							border: '1px solid #e6e8ef',
							borderRadius: 12,
							padding: 12,
							background: '#fafbff',
							maxHeight: 'calc(100vh - 160px)',
							overflow: 'auto',
							display: 'grid',
							gap: 12,
						}}
					>
						<div style={{ display: 'flex', gap: 8 }}>
							<button
								onClick={() => setMode('edit')}
								style={{
									...btnSmall,
									background: mode === 'edit' ? '#eef2ff' : '#fff',
								}}
							>
								Редактор
							</button>
							<button
								onClick={() => setMode('preview')}
								style={{
									...btnSmall,
									background: mode === 'preview' ? '#eef2ff' : '#fff',
								}}
							>
								Превью
							</button>
							<button
								style={btnSmall}
								onClick={() => {
									if (!schema) return;
									const res = cleanupManualEmptyContainers(schema);
									applySchemaChange(res.next, res.patch);
									if (selectedId && !res.next.nodes[selectedId]) {
										setSelectedId(null);
									}
								}}
								title="Удалить все пустые контейнеры, созданные вручную"
							>
								Очистить пустые ручные контейнеры
							</button>
							<SeedBlockTemplatesButton />
							<button
								onClick={handleUndo}
								style={btnSmall}
								disabled={!canUndo(historyRef.current)}
								title="Отменить (Ctrl/Cmd+Z)"
							>
								Undo
							</button>
							<button
								onClick={handleRedo}
								style={btnSmall}
								disabled={!canRedo(historyRef.current)}
								title="Повторить (Shift+Ctrl/Cmd+Z / Ctrl+Y)"
							>
								Redo
							</button>
						</div>

						{loading || !schema || !theme ? (
							<div style={{ padding: 12 }}>Загрузка…</div>
						) : mode === 'edit' ? (
							<div
								style={{
									border: '1px dashed #d7dbea',
									borderRadius: 10,
									padding: 12,
									background: '#fff',
								}}
							>
								<EditorRenderer
									schema={schema}
									theme={theme}
									onSchemaChange={(next, patch) => {
										applySchemaChange(next, patch);
										if (next.nodes[selectedId ?? ''] == null)
											setSelectedId(null);
									}}
									resolveTemplate={(k) => resolveTemplate(k)}
									onSelectNode={setSelectedId}
									selectedId={selectedId}
									scrollContainer={canvasRef as RefObject<HTMLElement>}
								/>
							</div>
						) : (
							<PreviewPane schema={schema} theme={theme} />
						)}
					</div>

					<div
						style={{
							border: '1px solid #e6e8ef',
							borderRadius: 12,
							padding: 12,
							background: '#fff',
							display: 'grid',
							gap: 12,
							alignContent: 'start',
							height: 'calc(100vh - 160px)',
							overflow: 'auto',
						}}
					>
						<div style={{ display: 'flex', gap: 8 }}>
							<button
								onClick={() => setRightTab('inspector')}
								style={{
									...btnSmall,
									background:
										rightTab === 'inspector' ? '#eef2ff' : '#fff',
								}}
							>
								Инспектор
							</button>
							<button
								onClick={() => setRightTab('theme')}
								style={{
									...btnSmall,
									background: rightTab === 'theme' ? '#eef2ff' : '#fff',
								}}
							>
								Тема
							</button>
						</div>

						{rightTab === 'inspector' ? (
							<Inspector
								schema={schema!}
								selectedId={selectedId}
								onChange={setSchema}
								theme={theme!}
								ownerId={user?.uid}
							/>
						) : (
							<ThemeEditor
								theme={theme!}
								onChange={setTheme}
								onReset={() => {}}
							/>
						)}
					</div>
				</div>
			</div>

			<div
				style={{
					display: 'grid',
					gap: 16,
					gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
					alignItems: 'start',
				}}
			>
				<JsonCard title="JSON — Текущая тема" obj={theme ?? {}} />
				<JsonCard title="JSON — Страница (текущее состояние)" obj={{ schema }} />
			</div>

			<CodePreviewModal
				open={showCode}
				onClose={() => setShowCode(false)}
				html={exported || ''}
				fileName="page-export.html"
				title="Исходный HTML (экспорт)"
				autoCloseAfterCopyMs={0}
			/>
		</div>
	);
}

const btn: React.CSSProperties = {
	padding: '8px 12px',
	borderRadius: 8,
	border: '1px solid #d0d3dc',
	background: '#f7f8fb',
	cursor: 'pointer',
};
const btnSmall: React.CSSProperties = {
	padding: '6px 10px',
	borderRadius: 8,
	border: '1px solid #d0d3dc',
	background: '#fff',
	cursor: 'pointer',
	fontSize: 12,
};

function JsonCard({ title, obj }: { title: string; obj: any }) {
	return (
		<div>
			<div
				style={{
					padding: 12,
					border: '1px solid #e6e8ef',
					borderRadius: 12,
					background: '#fff',
					marginBottom: 8,
				}}
			>
				<strong>{title}</strong>
			</div>
			<pre
				style={{
					margin: 0,
					padding: 12,
					border: '1px solid #e6e8ef',
					borderRadius: 12,
					background: '#fff',
					overflow: 'auto',
					maxHeight: 'calc(100vh - 220px)',
				}}
			>
				{JSON.stringify(obj, null, 2)}
			</pre>
		</div>
	);
}
