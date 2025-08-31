import React from 'react';
import type { ThemeTokens } from '@/types/siteTypes.ts';
import type { JSONContent } from '@tiptap/react';

type Props = {
	theme: ThemeTokens;
	onChange: (next: ThemeTokens) => void;
	onReset?: () => void;
};

export function ThemeEditor({ theme, onChange, onReset }: Props) {
	const set = (path: (string | number)[], value: unknown) => {
		const next = structuredClone(theme);
		let cur = next as JSONContent;
		for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
		cur[path[path.length - 1]] = value;
		onChange(next);
	};

	const num = (v: string, fallback: number) => {
		const n = Number(v);
		return Number.isFinite(n) ? n : fallback;
	};

	const SPACING_KEYS = ['8', '12', '16', '24', '32', '40', '48', '64'] as const;

	return (
		<div style={{ display: 'grid', gap: 16 }}>
			<Header onReset={onReset} />

			<Card title="Цвета">
				<Grid cols={2}>
					<ColorRow
						label="page"
						value={theme.colors.page}
						onChange={(v) => set(['colors', 'page'], v)}
					/>
					<ColorRow
						label="surface"
						value={theme.colors.surface}
						onChange={(v) => set(['colors', 'surface'], v)}
					/>
					<ColorRow
						label="border"
						value={theme.colors.border}
						onChange={(v) => set(['colors', 'border'], v)}
					/>

					<ColorRow
						label="text.base"
						value={theme.colors.text.base}
						onChange={(v) => set(['colors', 'text', 'base'], v)}
					/>
					<ColorRow
						label="text.muted"
						value={theme.colors.text.muted}
						onChange={(v) => set(['colors', 'text', 'muted'], v)}
					/>
					<ColorRow
						label="text.onPrimary"
						value={theme.colors.text.onPrimary}
						onChange={(v) => set(['colors', 'text', 'onPrimary'], v)}
					/>

					<ColorRow
						label="primary.500"
						value={theme.colors.primary['500']}
						onChange={(v) => set(['colors', 'primary', '500'], v)}
					/>
					<ColorRow
						label="primary.600"
						value={theme.colors.primary['600']}
						onChange={(v) => set(['colors', 'primary', '600'], v)}
					/>
					<TextRow
						label="primary.outline (rgba/hex)"
						value={theme.colors.primary.outline}
						onChange={(v) => set(['colors', 'primary', 'outline'], v)}
					/>
				</Grid>
			</Card>

			<Card title="Брейкпоинты">
				<Grid cols={3}>
					<NumberRow
						label="sm"
						value={theme.breakpoints.sm}
						onChange={(v) =>
							set(['breakpoints', 'sm'], num(v, theme.breakpoints.sm))
						}
					/>
					<NumberRow
						label="md"
						value={theme.breakpoints.md}
						onChange={(v) =>
							set(['breakpoints', 'md'], num(v, theme.breakpoints.md))
						}
					/>
					<NumberRow
						label="lg"
						value={theme.breakpoints.lg}
						onChange={(v) =>
							set(['breakpoints', 'lg'], num(v, theme.breakpoints.lg))
						}
					/>
				</Grid>
			</Card>

			<Card title="Радиусы и тени">
				<Grid cols={4}>
					<NumberRow
						label="radius.sm"
						value={theme.radius.sm}
						onChange={(v) => set(['radius', 'sm'], num(v, theme.radius.sm))}
					/>
					<NumberRow
						label="radius.md"
						value={theme.radius.md}
						onChange={(v) => set(['radius', 'md'], num(v, theme.radius.md))}
					/>
					<NumberRow
						label="radius.xl"
						value={theme.radius.xl}
						onChange={(v) => set(['radius', 'xl'], num(v, theme.radius.xl))}
					/>
					<NumberRow
						label="radius.pill"
						value={theme.radius.pill}
						onChange={(v) =>
							set(['radius', 'pill'], num(v, theme.radius.pill))
						}
					/>
				</Grid>

				<Grid cols={2} style={{ marginTop: 8 }}>
					<TextRow
						label="shadow.sm"
						value={theme.shadow.sm}
						onChange={(v) => set(['shadow', 'sm'], v)}
					/>
					<TextRow
						label="shadow.md"
						value={theme.shadow.md}
						onChange={(v) => set(['shadow', 'md'], v)}
					/>
				</Grid>
			</Card>

			<Card title="Типографика">
				<TextRow
					label="fontFamily"
					value={theme.typography?.fontFamily ?? ''}
					onChange={(v) => set(['typography', 'fontFamily'], v)}
				/>
				<Grid cols={3} style={{ marginTop: 8 }}>
					<NumberRow
						label="sizes.h1"
						value={theme.typography?.sizes?.h1 ?? 42}
						onChange={(v) =>
							set(
								['typography', 'sizes', 'h1'],
								num(v, theme.typography?.sizes?.h1 ?? 42),
							)
						}
					/>
					<NumberRow
						label="sizes.h2"
						value={theme.typography?.sizes?.h2 ?? 32}
						onChange={(v) =>
							set(
								['typography', 'sizes', 'h2'],
								num(v, theme.typography?.sizes?.h2 ?? 32),
							)
						}
					/>
					<NumberRow
						label="sizes.p"
						value={theme.typography?.sizes?.p ?? 16}
						onChange={(v) =>
							set(
								['typography', 'sizes', 'p'],
								num(v, theme.typography?.sizes?.p ?? 16),
							)
						}
					/>
				</Grid>
				<Grid cols={3} style={{ marginTop: 8 }}>
					<NumberRow
						label="lineHeights.h1"
						value={theme.typography?.lineHeights?.h1 ?? 1.2}
						step="0.05"
						onChange={(v) =>
							set(
								['typography', 'lineHeights', 'h1'],
								num(v, theme.typography?.lineHeights?.h1 ?? 1.2),
							)
						}
					/>
					<NumberRow
						label="lineHeights.h2"
						value={theme.typography?.lineHeights?.h2 ?? 1.25}
						step="0.05"
						onChange={(v) =>
							set(
								['typography', 'lineHeights', 'h2'],
								num(v, theme.typography?.lineHeights?.h2 ?? 1.25),
							)
						}
					/>
					<NumberRow
						label="lineHeights.p"
						value={theme.typography?.lineHeights?.p ?? 1.6}
						step="0.05"
						onChange={(v) =>
							set(
								['typography', 'lineHeights', 'p'],
								num(v, theme.typography?.lineHeights?.p ?? 1.6),
							)
						}
					/>
				</Grid>
			</Card>

			<Card title="Цитаты (blockquote)">
				<Grid cols={2}>
					<ColorRow
						label="Цвет текста"
						value={theme.components?.blockquote?.color || theme.colors.text.base}
						onChange={(v) => set(['components', 'blockquote', 'color'], v)}
					/>
					<ColorRow
						label="Цвет фона (RGBA)"
						value={theme.components?.blockquote?.bg || 'rgba(99, 102, 241, 0.05)'}
						onChange={(v) => set(['components', 'blockquote', 'bg'], v)}
					/>
					<ColorRow
						label="Цвет левой границы"
						value={theme.components?.blockquote?.borderColor || '#3b82f6'}
						onChange={(v) => set(['components', 'blockquote', 'borderColor'], v)}
					/>
					<NumberRow
						label="Толщина границы (px)"
						value={parseInt(theme.components?.blockquote?.borderLeft?.match(/\d+/)?.[0] || '4')}
						onChange={(v) => set(['components', 'blockquote', 'borderLeft'], `${v}px solid ${theme.components?.blockquote?.borderColor || '#3b82f6'}`)}
					/>
					<NumberRow
						label="Скругление углов"
						value={parseInt(theme.components?.blockquote?.radius as string || '8')}
						onChange={(v) => set(['components', 'blockquote', 'radius'], v)}
					/>
				</Grid>
			</Card>

			<Card title="Spacing (избранные ключи)">
				<Grid cols={4}>
					{SPACING_KEYS.map((k) => (
						<NumberRow
							key={k}
							label={k}
							value={theme.spacing[k] ?? 0}
							onChange={(v) =>
								set(['spacing', k], num(v, theme.spacing[k] ?? 0))
							}
						/>
					))}
				</Grid>
			</Card>
		</div>
	);
}

function Header({ onReset }: { onReset?: () => void }) {
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<b>Редактор темы</b>
			<div style={{ display: 'flex', gap: 8 }}>
				{onReset && (
					<button
						onClick={onReset}
						style={{
							padding: '6px 10px',
							borderRadius: 8,
							border: '1px solid #d0d3dc',
							background: '#fff',
							cursor: 'pointer',
							fontSize: 12,
						}}
					>
						Сбросить к дефолту
					</button>
				)}
			</div>
		</div>
	);
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div
			style={{
				border: '1px solid #e6e8ef',
				borderRadius: 12,
				padding: 12,
				background: '#fff',
			}}
		>
			<div style={{ fontWeight: 600, marginBottom: 10 }}>{title}</div>
			{children}
		</div>
	);
}

function Grid({
	cols = 2,
	children,
	style,
}: {
	cols?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<div
			style={{
				display: 'grid',
				gap: 8,
				gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
				...(style || {}),
			}}
		>
			{children}
		</div>
	);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<label style={{ display: 'grid', gap: 6, fontSize: 12 }}>
			<span style={{ color: '#687087' }}>{label}</span>
			{children}
		</label>
	);
}

function ColorRow({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	const isHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
	return (
		<Row label={label}>
			{isHex ? (
				<input
					type="color"
					value={value}
					onChange={(e) => onChange(e.target.value)}
				/>
			) : (
				<input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="#RRGGBB или rgba(...)"
				/>
			)}
		</Row>
	);
}

function TextRow({
	label,
	value,
	onChange,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
}) {
	return (
		<Row label={label}>
			<input value={value} onChange={(e) => onChange(e.target.value)} />
		</Row>
	);
}

function NumberRow({
	label,
	value,
	onChange,
	step,
}: {
	label: string;
	value: number;
	onChange: (v: string) => void;
	step?: string;
}) {
	return (
		<Row label={label}>
			<input
				type="number"
				value={value}
				step={step ?? '1'}
				onChange={(e) => onChange(e.target.value)}
			/>
		</Row>
	);
}
