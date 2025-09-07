import { Grid, NumberInput } from '@mantine/core';
import type { ThemeTokens } from '@/types/siteTypes.ts';
import { useThemeEditorContext } from '@/context/ThemeEditorContext/useThemeEditorContext.ts';

interface SpacingSectionProps {
	theme: ThemeTokens;
}

const SPACING_KEYS = ['8', '12', '16', '24', '32', '40', '48', '64'] as const;

export function SpacingSection({ theme }: SpacingSectionProps) {
	const { set, num } = useThemeEditorContext();

	return (
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
	);
}