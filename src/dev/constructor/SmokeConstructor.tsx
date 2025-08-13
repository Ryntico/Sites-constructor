import React, { useEffect, useMemo, useRef, useState } from 'react';
import { themeMock } from './mocks/theme.mock';
import { pageMock } from './mocks/page.mock';
import { exportPageToHtml } from './runtime/Renderer';
import type { PageSchema, NodeSubtree, ThemeTokens } from './runtime/types';
import { cloneSubtreeWithIds } from './runtime/schemaOps';
import { BLOCK_TEMPLATES } from './palette/blockTemplates';
import { EditorRenderer } from './runtime/EditorRenderer';
import { Inspector } from './Inspector';
import { PreviewPane } from '../preview/PreviewPane';
import { ThemeEditor } from '../theme/ThemeEditor';

function download(filename: string, content: string, mime = 'text/html'): void {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

function openFullPreview(html: string): void {
	const blob = new Blob([html], { type: 'text/html' });
	const url = URL.createObjectURL(blob);
	window.open(url, '_blank', 'noopener,noreferrer');
	setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function SmokeConstructor() {
	const [theme, setTheme] = useState<ThemeTokens>(() => {
		const raw = localStorage.getItem('dev:themeTokens');
		return raw ? JSON.parse(raw) : themeMock;
	});
	useEffect(() => {
		localStorage.setItem('dev:themeTokens', JSON.stringify(theme));
	}, [theme]);

	const [schema, setSchema] = useState<PageSchema>(() => {
		const saved = localStorage.getItem('dev:pageSchema');
		return saved ? JSON.parse(saved) : pageMock.schema;
	});
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [mode, setMode] = useState<'edit' | 'preview'>('edit');
	const [rightTab, setRightTab] = useState<'inspector' | 'theme'>('inspector');

	useEffect(() => {
		localStorage.setItem('dev:pageSchema', JSON.stringify(schema));
	}, [schema]);

	const exported = useMemo(
		() =>
			exportPageToHtml({
				title: pageMock.title,
				schema,
				theme,
			}),
		[schema, theme],
	);

	const resolveTemplate = (key: string): NodeSubtree | null => {
		const tpl = BLOCK_TEMPLATES.find((t) => t.key === key);
		return tpl ? cloneSubtreeWithIds(tpl.schema) : null;
	};

	const resetToMock = () => {
		setSchema(pageMock.schema);
		setSelectedId(null);
	};

	const clearAll = () => {
		setSchema({
			rootId: 'page_root',
			nodes: {
				page_root: {
					id: 'page_root',
					type: 'page',
					props: { style: { base: { bg: 'token:colors.page', px: 0, py: 0 } } },
					childrenOrder: [],
				} as any,
			},
		});
		setSelectedId(null);
	};

	const resetTheme = () => setTheme(themeMock);

	const canvasRef = useRef<HTMLDivElement>(null);

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
							onClick={() => download('page-export.html', exported)}
							style={btn}
						>
							Экспорт HTML
						</button>
						<button onClick={() => openFullPreview(exported)} style={btn}>
							Полный предпросмотр
						</button>
						<button onClick={resetToMock} style={btn}>
							Сброс страницы
						</button>
						<button onClick={clearAll} style={btn}>
							Очистить страницу
						</button>
						<button onClick={resetTheme} style={btn}>
							Сброс темы
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
					<Palette />

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
						</div>

						{mode === 'edit' ? (
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
									onSchemaChange={(next) => {
										setSchema(next);
										if (next.nodes[selectedId ?? ''] == null)
											setSelectedId(null);
									}}
									resolveTemplate={(k) => resolveTemplate(k)}
									onSelectNode={setSelectedId}
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
								schema={schema}
								selectedId={selectedId}
								onChange={setSchema}
								theme={theme}
							/>
						) : (
							<ThemeEditor
								theme={theme}
								onChange={setTheme}
								onReset={resetTheme}
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
				<JsonCard title="JSON — Текущая тема (текущее состояние)" obj={theme} />
				<JsonCard title="JSON — Страница (текущее состояние)" obj={{ schema }} />
			</div>
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

function Palette() {
	return (
		<div style={{ display: 'grid', gap: 10 }}>
			<div style={{ fontWeight: 600, marginBottom: 2 }}>Элементы</div>
			{BLOCK_TEMPLATES.map((tpl) => (
				<PaletteItem key={tpl.key} name={tpl.name} mimeKey={tpl.key} />
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
