import React, { useEffect, useMemo, useRef, useState } from 'react';
import { exportPageToHtml } from './runtime/Renderer';
import type { NodeSubtree } from './runtime/types';
import { cloneSubtreeWithIds } from './runtime/schemaOps';
import { EditorRenderer } from './runtime/EditorRenderer';
import { Inspector } from './Inspector';
import { PreviewPane } from '../preview/PreviewPane';
import { ThemeEditor } from '../theme/ThemeEditor';
import { useSiteBuilder } from '@/hooks/useSiteBuilder';
import { useAppSelector } from '@store/hooks.ts';
import { selectAuth } from '@store/slices/authSlice.ts';

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
							pageId,
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
						gridTemplateColumns: '280px 1fr 360px',
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
							maxHeight: '70vh',
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
							<SeedBlockTemplatesButton />
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
										setSchema(next, patch);
										if (next.nodes[selectedId ?? ''] == null)
											setSelectedId(null);
									}}
									resolveTemplate={(k) => resolveTemplate(k)}
									onSelectNode={setSelectedId}
									selectedId={selectedId}
									scrollContainer={canvasRef}
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
							maxHeight: '70vh',
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
			<ImageUploadDemo ownerId={user?.uid} />
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

function Palette({ items }: { items: { id: string; name: string }[] }) {
	return (
		<div style={{ display: 'grid', gap: 10 }}>
			<div style={{ fontWeight: 600, marginBottom: 2 }}>Элементы</div>
			{items.map((i) => (
				<PaletteItem key={i.id} name={i.name} mimeKey={i.id} />
			))}
		</div>
	);
}

function PaletteItem({ name, mimeKey }: { name: string; mimeKey: string }) {
	return (
		<div
			draggable
			onDragStart={(e) => {
				e.dataTransfer.setData('application/x-block-template', mimeKey);
				e.dataTransfer.effectAllowed = 'copy';
			}}
			style={{
				border: '1px solid #e6e8ef',
				borderRadius: 10,
				padding: 10,
				background: '#fff',
				cursor: 'grab',
				fontSize: 13,
				lineHeight: 1.2,
				minHeight: 44,
			}}
			title="Перетащите на полотно"
		>
			<div style={{ fontWeight: 500, marginBottom: 4 }}>{name}</div>
			<div style={{ fontSize: 11, color: '#687087' }}>Перетащите этот элемент</div>
		</div>
	);
}
