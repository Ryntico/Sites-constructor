import { InspectorSection } from '../InspectorSection.tsx';
import { InspectorGrid } from '../InspectorGrid.tsx';
import { TokenOnlyRow } from '@/components/constructor/Inspector/InspectorInputs/TokenOnlyRow.tsx';
import { SelectRow } from '@/components/constructor/Inspector/InspectorInputs/SelectRow.tsx';
import type { StyleShortcuts } from '@/types/siteTypes.ts';

interface DecorInspectorProps {
	patchStyle: (patch: Partial<StyleShortcuts>) => void;
	s: StyleShortcuts;
	radiusOptions: [string, string][];
	shadowOptions: [string, string][];
}

function tokenOrEmpty(v: unknown): string {
	return typeof v === 'string' && v.startsWith('token:')
		? v.replace(/^token:/, '')
		: '';
}

function isNumberLike(v: unknown) {
	return typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)));
}

export function DecorInspector({ patchStyle, s, radiusOptions, shadowOptions }: DecorInspectorProps) {
	return (
		<InspectorSection title="Декор">
			<InspectorGrid cols={1}>
				<TokenOnlyRow
					label="радиус границ"
					currentValue={tokenOrEmpty(s.radius)}
					onTokenChange={(tok) =>
						patchStyle({
							radius: tok ? `token:${tok}` : undefined,
						})
					}
					options={radiusOptions}
					allowManualNumber
					manualValue={isNumberLike(s.radius) ? String(s.radius) : ''}
					onManualChange={(v) =>
						patchStyle({ radius: v === '' ? undefined : Number(v) || 0 })
					}
				/>
				<TokenOnlyRow
					label="тень"
					currentValue={tokenOrEmpty(s.shadow)}
					onTokenChange={(tok) =>
						patchStyle({
							shadow: tok ? `token:${tok}` : undefined,
						})
					}
					options={shadowOptions}
				/>
				<SelectRow
					label="выравнивание текста"
					value={s.textAlign ?? ''}
					onChange={(v) => patchStyle({ textAlign: v || undefined })}
					options={[
						['', '—'],
						['left', 'left'],
						['center', 'center'],
						['right', 'right'],
					]}
				/>
			</InspectorGrid>
		</InspectorSection>
	);
}