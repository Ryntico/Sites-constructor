import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';
import {
	Paper,
	Tabs,
	Button,
	Group,
	Title,
	Text,
	Card,
	ScrollArea,
	Box,
	Grid,
} from '@mantine/core';
import { exportPageToHtml } from './render/exportHtml.ts';
import { cleanupManualEmptyContainers, cloneSubtreeWithIds } from './ops/schemaOps.ts';
import { EditorRenderer } from './editor/EditorRenderer.tsx';
import { Inspector } from './Inspector/index.tsx';
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
import { useParams } from 'react-router-dom';
import { SiteNameEditor } from '@components/siteNameEditor/SiteNameEditor.tsx';

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
	const { id: siteId } = useParams();

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
		createPageFromTemplateId,
	} = useSiteBuilder(siteId ?? '', 'home');

	const { user } = useAppSelector(selectAuth);
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [mode, setMode] = useState<'edit' | 'preview'>('edit');
	const [rightTab, setRightTab] = useState<'inspector' | 'theme'>('inspector');
	const [showCode, setShowCode] = useState(false);

	const historyKey = `hist:${siteId ?? 'no-siteNameEditor'}:${page?.id ?? 'no-page'}`;

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
			<Box p="lg">
				<Title order={3} mb="md">
					Сайтов нет
				</Title>
			</Box>
		);
	}

	if (needsPage) {
		return (
			<Box p="lg">
				<Title order={3} mb="md">
					Нет страниц
				</Title>
				<Button
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
				</Button>
			</Box>
		);
	}

	return (
		<Box p="md" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
			<Paper withBorder radius="md">
				<Box p="md" style={{ borderBottom: '1px solid #e6e8ef' }}>
					<Group justify="space-between" align="center" wrap="wrap">
						<SiteNameEditor
							siteId={siteId!}
							initialName={site?.name || ''}
							variant="unstyled"
							size="lg"
							className="text-xl font-semibold"
						/>
						<Group wrap="wrap">
							<Button
								onClick={() => setShowCode(true)}
								disabled={!exported}
								title={
									!exported
										? 'Данные ещё грузятся…'
										: 'Показать HTML-код'
								}
								size="sm"
								variant="outline"
							>
								Посмотреть код
							</Button>
							<Button
								onClick={() =>
									exported && download('page-export.html', exported)
								}
								disabled={!exported}
								title={
									!exported ? 'Данные ещё грузятся…' : 'Скачать HTML'
								}
								size="sm"
								variant="outline"
							>
								Экспорт HTML
							</Button>
							<Button
								onClick={() => exported && openFullPreview(exported)}
								disabled={!exported}
								title={
									!exported ? 'Данные ещё грузятся…' : 'Открыть превью'
								}
								size="sm"
								variant="outline"
							>
								Полный предпросмотр
							</Button>
						</Group>
					</Group>
				</Box>

				<Box p="md">
					<Box style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
						{/* Palette - фиксированная ширина */}
						<Box style={{ flex: '0 0 auto' }}>
							<Palette
								items={blockTemplates.map((b) => ({
									id: b.id,
									name: b.name,
								}))}
							/>
						</Box>

						{/* Editor - основное пространство с защитой от сжатия */}
						<Box
							style={{
								flex: '1 1 0%',
								minWidth: 0, // Важно: предотвращает сжатие контента
								height: 'calc(100vh - 160px)',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<Paper
								withBorder
								p="md"
								style={{
									flex: 1,
									overflow: 'auto',
									display: 'flex',
									flexDirection: 'column',
									gap: 12,
								}}
							>
								<Group>
									<Button
										onClick={() => setMode('edit')}
										variant={mode === 'edit' ? 'filled' : 'outline'}
										size="xs"
									>
										Редактор
									</Button>
									<Button
										onClick={() => setMode('preview')}
										variant={
											mode === 'preview' ? 'filled' : 'outline'
										}
										size="xs"
									>
										Превью
									</Button>
									<Button
										onClick={() => {
											if (!schema) return;
											const res =
												cleanupManualEmptyContainers(schema);
											applySchemaChange(res.next, res.patch);
											if (
												selectedId &&
												!res.next.nodes[selectedId]
											) {
												setSelectedId(null);
											}
										}}
										title="Удалить все пустые контейнеры, созданные вручную"
										size="xs"
										variant="outline"
									>
										Очистить пустые контейнеры
									</Button>
									<SeedBlockTemplatesButton />
									<Button
										onClick={handleUndo}
										disabled={!canUndo(historyRef.current)}
										title="Отменить (Ctrl/Cmd+Z)"
										size="xs"
										variant="outline"
									>
										Undo
									</Button>
									<Button
										onClick={handleRedo}
										disabled={!canRedo(historyRef.current)}
										title="Повторить (Shift+Ctrl/Cmd+Z / Ctrl+Y)"
										size="xs"
										variant="outline"
									>
										Redo
									</Button>
								</Group>

								{loading || !schema || !theme ? (
									<Text p="md">Загрузка…</Text>
								) : mode === 'edit' ? (
									<div style={{ all: 'initial' }}>
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
											scrollContainer={
												canvasRef as RefObject<HTMLElement>
											}
										/>
									</div>
								) : (
									<div style={{ all: 'initial' }}>
										<PreviewPane schema={schema} theme={theme} />
									</div>
								)}
							</Paper>
						</Box>

						<Box style={{ flex: '0 0 360px' }}>
							<Paper
								withBorder
								p="md"
								style={{
									display: 'flex',
									flexDirection: 'column',
									gap: 12,
									height: 'calc(100vh - 160px)',
									overflow: 'auto',
								}}
							>
								<Tabs
									value={rightTab}
									onChange={(value) => {
										if (value === 'inspector' || value === 'theme') {
											setRightTab(value);
										}
									}}
								>
									<Tabs.List>
										<Tabs.Tab value="inspector">Инспектор</Tabs.Tab>
										<Tabs.Tab value="theme">Тема</Tabs.Tab>
									</Tabs.List>

									<Tabs.Panel value="inspector" pt="xs">
										<Inspector
											schema={schema!}
											selectedId={selectedId}
											onChange={setSchema}
											theme={theme!}
											ownerId={user?.uid}
										/>
									</Tabs.Panel>

									<Tabs.Panel value="theme" pt="xs">
										{theme && (
											<ThemeEditor
												theme={theme!}
												onChange={setTheme}
												onReset={() => {}}
											/>
										)}
									</Tabs.Panel>
								</Tabs>
							</Paper>
						</Box>
					</Box>
				</Box>
			</Paper>

			<Grid>
				<Grid.Col span={6}>
					<JsonCard title="JSON — Текущая тема" obj={theme ?? {}} />
				</Grid.Col>
				<Grid.Col span={6}>
					<JsonCard
						title="JSON — Страница (текущее состояние)"
						obj={{ schema }}
					/>
				</Grid.Col>
			</Grid>

			<CodePreviewModal
				open={showCode}
				onClose={() => setShowCode(false)}
				html={exported || ''}
				fileName="page-export.html"
				title="Исходный HTML (экспорт)"
				autoCloseAfterCopyMs={0}
			/>
		</Box>
	);
}

function JsonCard({ title, obj }: { title: string; obj: object }) {
	return (
		<Card withBorder>
			<Card.Section withBorder p="md">
				<Title order={5}>{title}</Title>
			</Card.Section>
			<ScrollArea.Autosize mah="calc(100vh - 220px)">
				<Box p="md">
					<pre style={{ margin: 0, fontSize: 12 }}>
						{JSON.stringify(obj, null, 2)}
					</pre>
				</Box>
			</ScrollArea.Autosize>
		</Card>
	);
}
