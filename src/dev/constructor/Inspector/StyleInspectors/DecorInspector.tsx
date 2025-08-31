import { InspectorSection } from '../InspectorSection';
import { InspectorGrid } from '../InspectorGrid';
import { TokenOnlyRow } from '@/dev/constructor/components/InspectorInputs/TokenOnlyRow';
import { SelectRow } from '@/dev/constructor/components/InspectorInputs/SelectRow';
import type { StyleShortcuts } from '@/types/siteTypes';

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