import { InspectorSection } from '../InspectorSection.tsx';
import { InspectorGrid } from '../InspectorGrid.tsx';
import { SelectRow } from '@components/constructor/Inspector/InspectorInputs/SelectRow.tsx';
import { NumRow } from '@components/constructor/Inspector/InspectorInputs/NumRow.tsx';
import type { StyleShortcuts } from '@/types/siteTypes.ts';

interface FlexItemInspectorProps {
	patchStyle: (patch: Partial<StyleShortcuts>) => void;
	s: StyleShortcuts;
}

function processOrder(v: number | undefined): number | undefined {
	if (v === undefined) return undefined;
	return Number.isFinite(v) ? v : 0;
}

export function FlexItemInspector({ patchStyle, s }: FlexItemInspectorProps) {
	return (
		<InspectorSection title="Свойства флекс элементов">
			<InspectorGrid cols={2}>
				<SelectRow
					label="align-self"
					value={s.alignSelf ?? ''}
					onChange={(v) => patchStyle({ alignSelf: v })}
					options={[
						['', '—'],
						['start', 'start'],
						['center', 'center'],
						['end', 'end'],
						['baseline', 'baseline'],
						['stretch', 'stretch'],
					]}
				/>
				<NumRow
					label="order"
					value={s.order}
					onChange={(v) => patchStyle({ order: processOrder(v) })}
				/>
				<SelectRow
					label="flex-grow"
					value={s.flexGrow ?? ''}
					onChange={(v) => patchStyle({ flexGrow: v })}
					options={[
						['', '—'],
						['1', '1'],
						['0', '0'],
					]}
				/>
				<SelectRow
					label="flex-shrink"
					value={s.flexShrink ?? ''}
					onChange={(v) => patchStyle({ flexShrink: v })}
					options={[
						['', '—'],
						['1', '1'],
						['0', '0'],
					]}
				/>
			</InspectorGrid>
		</InspectorSection>
	);
}