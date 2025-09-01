import React from 'react';
import {
	Paper,
	Grid,
	TextInput,
	NumberInput,
	ColorInput,
	Title,
	Group,
	Button,
	Box
} from '@mantine/core';
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

	const num = (v: number | string, fallback: number) => {
		const n = typeof v === 'number' ? v : Number(v);
		return Number.isFinite(n) ? n : fallback;
	};

	const SPACING_KEYS = ['8', '12', '16', '24', '32', '40', '48', '64'] as const;

	return (
		<Box style={{ display: 'grid', gap: 16 }}>
			<Header onReset={onReset} />

			<Card title="Цвета">
				<Grid>
					<Grid.Col span={6}>
						<ColorInput
							label="page"
							value={theme.colors.page}
							onChange={(v) => set(['colors', 'page'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<ColorInput
							label="surface"
							value={theme.colors.surface}
							onChange={(v) => set(['colors', 'surface'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<ColorInput
							label="border"
							value={theme.colors.border}
							onChange={(v) => set(['colors', 'border'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<ColorInput
							label="text.base"
							value={theme.colors.text.base}
							onChange={(v) => set(['colors', 'text', 'base'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<ColorInput
							label="text.muted"
							value={theme.colors.text.muted}
							onChange={(v) => set(['colors', 'text', 'muted'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<ColorInput
							label="text.onPrimary"
							value={theme.colors.text.onPrimary}
							onChange={(v) => set(['colors', 'text', 'onPrimary'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<ColorInput
							label="primary.500"
							value={theme.colors.primary['500']}
							onChange={(v) => set(['colors', 'primary', '500'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<ColorInput
							label="primary.600"
							value={theme.colors.primary['600']}
							onChange={(v) => set(['colors', 'primary', '600'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={12}>
						<TextInput
							label="primary.outline (rgba/hex)"
							value={theme.colors.primary.outline}
							onChange={(e) => set(['colors', 'primary', 'outline'], e.currentTarget.value)}
							size="xs"
						/>
					</Grid.Col>
				</Grid>
			</Card>

			<Card title="Брейкпоинты">
				<Grid>
					<Grid.Col span={4}>
						<NumberInput
							label="sm"
							value={theme.breakpoints.sm}
							onChange={(v) => set(['breakpoints', 'sm'], num(v, theme.breakpoints.sm))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={4}>
						<NumberInput
							label="md"
							value={theme.breakpoints.md}
							onChange={(v) => set(['breakpoints', 'md'], num(v, theme.breakpoints.md))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={4}>
						<NumberInput
							label="lg"
							value={theme.breakpoints.lg}
							onChange={(v) => set(['breakpoints', 'lg'], num(v, theme.breakpoints.lg))}
							size="xs"
						/>
					</Grid.Col>
				</Grid>
			</Card>

			<Card title="Радиусы и тени">
				<Grid>
					<Grid.Col span={3}>
						<NumberInput
							label="radius.sm"
							value={theme.radius.sm}
							onChange={(v) => set(['radius', 'sm'], num(v, theme.radius.sm))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={3}>
						<NumberInput
							label="radius.md"
							value={theme.radius.md}
							onChange={(v) => set(['radius', 'md'], num(v, theme.radius.md))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={3}>
						<NumberInput
							label="radius.xl"
							value={theme.radius.xl}
							onChange={(v) => set(['radius', 'xl'], num(v, theme.radius.xl))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={3}>
						<NumberInput
							label="radius.pill"
							value={theme.radius.pill}
							onChange={(v) => set(['radius', 'pill'], num(v, theme.radius.pill))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6} mt="md">
						<TextInput
							label="shadow.sm"
							value={theme.shadow.sm}
							onChange={(e) => set(['shadow', 'sm'], e.currentTarget.value)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6} mt="md">
						<TextInput
							label="shadow.md"
							value={theme.shadow.md}
							onChange={(e) => set(['shadow', 'md'], e.currentTarget.value)}
							size="xs"
						/>
					</Grid.Col>
				</Grid>
			</Card>

			<Card title="Типографика">
				<TextInput
					label="fontFamily"
					value={theme.typography?.fontFamily ?? ''}
					onChange={(e) => set(['typography', 'fontFamily'], e.currentTarget.value)}
					size="xs"
					mb="md"
				/>

				<Grid>
					<Grid.Col span={4}>
						<NumberInput
							label="sizes.h1"
							value={theme.typography?.sizes?.h1 ?? 42}
							onChange={(v) => set(['typography', 'sizes', 'h1'], num(v, theme.typography?.sizes?.h1 ?? 42))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={4}>
						<NumberInput
							label="sizes.h2"
							value={theme.typography?.sizes?.h2 ?? 32}
							onChange={(v) => set(['typography', 'sizes', 'h2'], num(v, theme.typography?.sizes?.h2 ?? 32))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={4}>
						<NumberInput
							label="sizes.p"
							value={theme.typography?.sizes?.p ?? 16}
							onChange={(v) => set(['typography', 'sizes', 'p'], num(v, theme.typography?.sizes?.p ?? 16))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={4} mt="md">
						<NumberInput
							label="lineHeights.h1"
							value={theme.typography?.lineHeights?.h1 ?? 1.2}
							step={0.05}
							onChange={(v) => set(['typography', 'lineHeights', 'h1'], num(v, theme.typography?.lineHeights?.h1 ?? 1.2))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={4} mt="md">
						<NumberInput
							label="lineHeights.h2"
							value={theme.typography?.lineHeights?.h2 ?? 1.25}
							step={0.05}
							onChange={(v) => set(['typography', 'lineHeights', 'h2'], num(v, theme.typography?.lineHeights?.h2 ?? 1.25))}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={4} mt="md">
						<NumberInput
							label="lineHeights.p"
							value={theme.typography?.lineHeights?.p ?? 1.6}
							step={0.05}
							onChange={(v) => set(['typography', 'lineHeights', 'p'], num(v, theme.typography?.lineHeights?.p ?? 1.6))}
							size="xs"
						/>
					</Grid.Col>
				</Grid>
			</Card>

			<Card title="Цитаты (blockquote)">
				<Grid>
					<Grid.Col span={6}>
						<ColorInput
							label="Цвет текста"
							value={theme.components?.blockquote?.color || theme.colors.text.base}
							onChange={(v) => set(['components', 'blockquote', 'color'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<TextInput
							label="Цвет фона (RGBA)"
							value={theme.components?.blockquote?.bg || 'rgba(99, 102, 241, 0.05)'}
							onChange={(e) => set(['components', 'blockquote', 'bg'], e.currentTarget.value)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<ColorInput
							label="Цвет левой границы"
							value={theme.components?.blockquote?.borderColor || '#3b82f6'}
							onChange={(v) => set(['components', 'blockquote', 'borderColor'], v)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<NumberInput
							label="Толщина границы (px)"
							value={parseInt(theme.components?.blockquote?.borderLeft?.match(/\d+/)?.[0] || '4')}
							onChange={(v) => set(['components', 'blockquote', 'borderLeft'], `${v}px solid ${theme.components?.blockquote?.borderColor || '#3b82f6'}`)}
							size="xs"
						/>
					</Grid.Col>
					<Grid.Col span={6}>
						<NumberInput
							label="Скругление углов"
							value={parseInt(theme.components?.blockquote?.radius as string || '8')}
							onChange={(v) => set(['components', 'blockquote', 'radius'], v)}
							size="xs"
						/>
					</Grid.Col>
				</Grid>
			</Card>

			<Card title="Spacing (избранные ключи)">
				<Grid>
					{SPACING_KEYS.map((k) => (
						<Grid.Col key={k} span={3}>
							<NumberInput
								label={k}
								value={theme.spacing[k] ?? 0}
								onChange={(v) => set(['spacing', k], num(v, theme.spacing[k] ?? 0))}
								size="xs"
							/>
						</Grid.Col>
					))}
				</Grid>
			</Card>
		</Box>
	);
}

function Header({ onReset }: { onReset?: () => void }) {
	return (
		<Group justify="space-between" align="center">
			<Title order={4}>Редактор темы</Title>
			{onReset && (
				<Button
					onClick={onReset}
					variant="outline"
					size="xs"
				>
					Сбросить к дефолту
				</Button>
			)}
		</Group>
	);
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Paper withBorder p="md">
			<Title order={5} mb="sm">{title}</Title>
			{children}
		</Paper>
	);
}