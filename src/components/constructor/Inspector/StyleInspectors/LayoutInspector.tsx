import { InspectorSection } from '../InspectorSection.tsx';
import { InspectorGrid } from '../InspectorGrid.tsx';
import { SelectRow } from '@components/constructor/Inspector/InspectorInputs/SelectRow.tsx';
import type { NodeJson, StyleShortcuts } from '@/types/siteTypes.ts';

interface LayoutInspectorProps {
	node: NodeJson;
	patchStyle: (patch: Partial<StyleShortcuts>) => void;
	s: StyleShortcuts;
}

export function LayoutInspector({ patchStyle, s }: LayoutInspectorProps) {
	return (
		<InspectorSection title="Настройки блока">
			<InspectorGrid cols={3}>
				<SelectRow
					label="display"
					value={s.display ?? ''}
					onChange={(v) => patchStyle({ display: v || undefined })}
					options={[
						['', '—'],
						['block', 'block'],
						['flex', 'flex'],
						['inline-flex', 'inline-flex'],
						['grid', 'grid'],
					]}
				/>

				{s.display === 'flex' && (
					<SelectRow
						label="direction"
						value={s.flexDirection ?? ''}
						onChange={(v) =>
							patchStyle({ flexDirection: v || undefined })
						}
						options={[
							['', '—'],
							['row', 'row'],
							['row-reverse', 'row-reverse'],
							['column', 'column'],
							['column-reverse', 'column-reverse'],
						]}
					/>
				)}
				{s.display === 'flex' && (
					<SelectRow
						label="flex-wrap"
						value={s.wrap ?? ''}
						onChange={(v) => patchStyle({ wrap: v || undefined })}
						options={[
							['', '—'],
							['nowrap', 'nowrap'],
							['wrap', 'wrap'],
							['wrap-reverse', 'wrap-reverse'],
						]}
					/>
				)}
			</InspectorGrid>

			{s.display === 'flex' && (
				<InspectorGrid cols={3}>
					<SelectRow
						label="align-items"
						value={s.items ?? ''}
						onChange={(v) => patchStyle({ items: v || undefined })}
						options={[
							['', '—'],
							['start', 'start'],
							['center', 'center'],
							['end', 'end'],
							['baseline', 'baseline'],
							['stretch', 'stretch'],
						]}
					/>
					<SelectRow
						label="justify-content"
						value={s.justify ?? ''}
						onChange={(v) => patchStyle({ justify: v || undefined })}
						options={[
							['', '—'],
							['start', 'start'],
							['center', 'center'],
							['end', 'end'],
							['between', 'between'],
							['around', 'around'],
							['evenly', 'evenly'],
						]}
					/>
				</InspectorGrid>
			)}
		</InspectorSection>
	);
}