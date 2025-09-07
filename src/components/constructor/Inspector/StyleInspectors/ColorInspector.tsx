import { InspectorSection } from '../InspectorSection.tsx';
import { InspectorGrid } from '../InspectorGrid.tsx';
import { ColorTokenRow } from '@components/constructor/Inspector/InspectorInputs/ColorTokenRow.tsx';
import type { StyleShortcuts } from '@/types/siteTypes.ts';

interface ColorInspectorProps {
	patchStyle: (patch: Partial<StyleShortcuts>) => void;
	s: StyleShortcuts;
	colorOptions: [string, string][];
}

function toStr(v: number | string | undefined): string {
	return v == null ? '' : String(v);
}

function tokenOrEmpty(v: unknown): string {
	return typeof v === 'string' && v.startsWith('token:')
		? v.replace(/^token:/, '')
		: '';
}

function emptyToUndef(s: string): string | undefined {
	return s.trim() === '' ? undefined : s;
}

export function ColorInspector({ patchStyle, s, colorOptions }: ColorInspectorProps) {
	return (
		<InspectorSection title="Цвета / фон / границы">
			<InspectorGrid cols={3}>
				<ColorTokenRow
					label="цвет фона"
					value={toStr(s.bg)}
					onText={(v) => patchStyle({ bg: emptyToUndef(v) })}
					tokenValue={tokenOrEmpty(s.bg)}
					onTokenChange={(tok) =>
						patchStyle({ bg: tok ? `token:${tok}` : undefined })
					}
					options={colorOptions}
				/>
				<ColorTokenRow
					label="цвет текста"
					value={toStr(s.color)}
					onText={(v) => patchStyle({ color: emptyToUndef(v) })}
					tokenValue={tokenOrEmpty(s.color)}
					onTokenChange={(tok) =>
						patchStyle({
							color: tok ? `token:${tok}` : undefined,
						})
					}
					options={colorOptions}
				/>
				<ColorTokenRow
					label="цвет границы"
					value={toStr(s.borderColor)}
					onText={(v) => patchStyle({ borderColor: emptyToUndef(v) })}
					tokenValue={tokenOrEmpty(s.borderColor)}
					onTokenChange={(tok) =>
						patchStyle({
							borderColor: tok ? `token:${tok}` : undefined,
						})
					}
					options={colorOptions}
				/>
			</InspectorGrid>
		</InspectorSection>
	);
}