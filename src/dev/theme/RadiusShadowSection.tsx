import { Grid, NumberInput, TextInput } from '@mantine/core';
import type { ThemeTokens } from '@/types/siteTypes.ts';
import { useThemeEditorContext } from '../context/ThemeEditorContext/useThemeEditorContext.ts';

interface RadiusShadowSectionProps {
	theme: ThemeTokens;
}

export function RadiusShadowSection({ theme }: RadiusShadowSectionProps) {
	const { set, num } = useThemeEditorContext();

	return (
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
	);
}