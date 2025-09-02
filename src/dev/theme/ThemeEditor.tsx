import { Box } from '@mantine/core';
import type { ThemeTokens } from '@/types/siteTypes.ts';

import { Header } from './Header';
import { Card } from './Card';
import { ColorsSection } from './ColorsSection';
import { BreakpointsSection } from './BreakpointsSection';
import { RadiusShadowSection } from './RadiusShadowSection';
import { TypographySection } from './TypographySection';
import { BlockquoteSection } from './BlockquoteSection';
import { SpacingSection } from './SpacingSection';
import { ThemeEditorProvider } from '@/dev/context/ThemeEditorContext/ThemeEditorContext.tsx';

type Props = {
	theme: ThemeTokens;
	onChange: (next: ThemeTokens) => void;
	onReset?: () => void;
};

export function ThemeEditor({ theme, onChange, onReset }: Props) {
	return (
		<ThemeEditorProvider theme={theme} onChange={onChange}>
			<Box style={{ display: 'grid', gap: 16 }}>
				<Header onReset={onReset} />

				<Card title="Цвета">
					<ColorsSection theme={theme} />
				</Card>

				<Card title="Брейкпоинты">
					<BreakpointsSection theme={theme} />
				</Card>

				<Card title="Радиусы и тени">
					<RadiusShadowSection theme={theme} />
				</Card>

				<Card title="Типографика">
					<TypographySection theme={theme} />
				</Card>

				<Card title="Цитаты (blockquote)">
					<BlockquoteSection theme={theme} />
				</Card>

				<Card title="Spacing (избранные ключи)">
					<SpacingSection theme={theme} />
				</Card>
			</Box>
		</ThemeEditorProvider>
	);
}