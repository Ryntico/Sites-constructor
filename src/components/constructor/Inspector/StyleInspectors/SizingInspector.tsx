import { InspectorSection } from '../InspectorSection.tsx';
import { InspectorGrid } from '../InspectorGrid.tsx';
import { TextRow } from '@components/constructor/Inspector/InspectorInputs/TextRow.tsx';
import type { StyleShortcuts } from '@/types/siteTypes.ts';

interface SizingInspectorProps {
	patchStyle: (patch: Partial<StyleShortcuts>) => void;
	s: StyleShortcuts;
}

function toStr(v: number | string | undefined): string {
	return v == null ? '' : String(v);
}

function processSizeValue(value: string): number | string | undefined {
	const trimmed = value.trim();
	if (trimmed === '') return undefined;

	const num = Number(trimmed);
	if (!isNaN(num) && trimmed === num.toString()) {
		return num;
	}
	return trimmed;
}

export function SizingInspector({ patchStyle, s }: SizingInspectorProps) {
	return (
		<InspectorSection title="Размеры (по умолчанию: 100%)">
			<InspectorGrid cols={2} style={{ marginTop: 8 }}>
				<TextRow
					label="ширина"
					value={toStr(s.w)}
					onChange={(v) => patchStyle({ w: processSizeValue(v) })}
					placeholder="число(px)"
				/>
				<TextRow
					label="высота"
					value={toStr(s.h)}
					onChange={(v) => patchStyle({ h: processSizeValue(v) })}
					placeholder="число(px)"
				/>
				<TextRow
					label="макс. ширина"
					value={toStr(s.maxW)}
					onChange={(v) => patchStyle({ maxW: processSizeValue(v) })}
					placeholder="число(px)"
				/>
				<TextRow
					label="макс. высота"
					value={toStr(s.maxH)}
					onChange={(v) => patchStyle({ maxH: processSizeValue(v) })}
					placeholder="число(px)"
				/>
			</InspectorGrid>
		</InspectorSection>
	);
}