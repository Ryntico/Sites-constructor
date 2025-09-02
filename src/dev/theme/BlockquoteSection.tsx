import { Grid, ColorInput, TextInput, NumberInput } from '@mantine/core';
import type { ThemeTokens } from '@/types/siteTypes.ts';
import { useThemeEditorContext } from '../context/ThemeEditorContext/useThemeEditorContext.ts';

interface BlockquoteSectionProps {
	theme: ThemeTokens;
}

export function BlockquoteSection({ theme }: BlockquoteSectionProps) {
	const { set } = useThemeEditorContext();

	const borderLeftWidth = parseInt(theme.components?.blockquote?.borderLeft?.match(/\d+/)?.[0] || '4');
	const radius = parseInt(theme.components?.blockquote?.radius as string || '8');

	return (
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
					value={borderLeftWidth}
					onChange={(v) => set(['components', 'blockquote', 'borderLeft'], `${v}px solid ${theme.components?.blockquote?.borderColor || '#3b82f6'}`)}
					size="xs"
				/>
			</Grid.Col>
			<Grid.Col span={6}>
				<NumberInput
					label="Скругление углов"
					value={radius}
					onChange={(v) => set(['components', 'blockquote', 'radius'], v)}
					size="xs"
				/>
			</Grid.Col>
		</Grid>
	);
}