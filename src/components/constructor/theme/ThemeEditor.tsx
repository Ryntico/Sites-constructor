import { Box } from '@mantine/core';
import type { ThemeTokens } from '@/types/siteTypes.ts';

import { Header } from './Header.tsx';
import { Card } from './Card.tsx';
import { ColorsSection } from './ColorsSection.tsx';
import { BreakpointsSection } from './BreakpointsSection.tsx';
import { RadiusShadowSection } from './RadiusShadowSection.tsx';
import { TypographySection } from './TypographySection.tsx';
import { BlockquoteSection } from './BlockquoteSection.tsx';
import { SpacingSection } from './SpacingSection.tsx';
import { ThemeEditorProvider } from '@/context/ThemeEditorContext/ThemeEditorContext.tsx';

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