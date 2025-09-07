import { Grid, NumberInput } from '@mantine/core';
import type { ThemeTokens } from '@/types/siteTypes.ts';
import { useThemeEditorContext } from '@/context/ThemeEditorContext/useThemeEditorContext.ts';

interface BreakpointsSectionProps {
	theme: ThemeTokens;
}

export function BreakpointsSection({ theme }: BreakpointsSectionProps) {
	const { set, num } = useThemeEditorContext();

	return (
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
	);
}