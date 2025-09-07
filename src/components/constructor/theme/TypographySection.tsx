import { Grid, NumberInput, TextInput } from '@mantine/core';
import type { ThemeTokens } from '@/types/siteTypes.ts';
import { useThemeEditorContext } from '@/context/ThemeEditorContext/useThemeEditorContext.ts';

interface TypographySectionProps {
	theme: ThemeTokens;
}

export function TypographySection({ theme }: TypographySectionProps) {
	const { set, num } = useThemeEditorContext();

	return (
		<>
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
		</>
	);
}