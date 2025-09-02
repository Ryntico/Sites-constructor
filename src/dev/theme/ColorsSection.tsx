import { Grid, ColorInput, TextInput } from '@mantine/core';
import type { ThemeTokens } from '@/types/siteTypes.ts';
import { useThemeEditorContext } from '../context/ThemeEditorContext/useThemeEditorContext.ts';

interface ColorsSectionProps {
	theme: ThemeTokens;
}

export function ColorsSection({ theme }: ColorsSectionProps) {
	const { set } = useThemeEditorContext();

	return (
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
	);
}