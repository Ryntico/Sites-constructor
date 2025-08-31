import { InspectorSection } from '../InspectorSection';
import { InspectorGrid } from '../InspectorGrid';
import { NumOrTokenRow } from '@/dev/constructor/components/InspectorInputs/NumOrTokenRow';
import { NumRow } from '@/dev/constructor/components/InspectorInputs/NumRow';
import type { NodeJson, StyleShortcuts } from '@/types/siteTypes';

interface SpacingInspectorProps {
	patchStyle: (patch: Partial<StyleShortcuts>) => void;
	s: StyleShortcuts;
	spacingOptions: [string, string][];
	node: NodeJson;
}

function tokenOrEmpty(v: unknown): string {
	return typeof v === 'string' && v.startsWith('token:')
		? v.replace(/^token:/, '')
		: '';
}

export function SpacingInspector({ patchStyle, s, spacingOptions }: SpacingInspectorProps) {
	return (
		<InspectorSection title="Отступы">
			{s.display === 'flex' && (
				<InspectorGrid cols={1}>
					<NumOrTokenRow
						label="gap (промежутки)"
						value={s.gap}
						onNumChange={(v) => patchStyle({ gap: v })}
						tokenValue={tokenOrEmpty(s.gap)}
						onTokenChange={(tok) =>
							patchStyle({ gap: tok ? `token:${tok}` : undefined })
						}
						tokenOptions={spacingOptions}
					/>
				</InspectorGrid>
			)}

			<InspectorGrid cols={1}>
				<NumOrTokenRow
					label="padding"
					value={s.p}
					onNumChange={(v) => patchStyle({ p: v })}
					tokenValue={tokenOrEmpty(s.p)}
					onTokenChange={(t) =>
						patchStyle({ p: t ? `token:${t}` : undefined })
					}
					tokenOptions={spacingOptions}
				/>
				<NumOrTokenRow
					label="padding-x"
					value={s.px}
					onNumChange={(v) => patchStyle({ px: v })}
					tokenValue={tokenOrEmpty(s.px)}
					onTokenChange={(t) =>
						patchStyle({ px: t ? `token:${t}` : undefined })
					}
					tokenOptions={spacingOptions}
				/>
				<NumOrTokenRow
					label="padding-y"
					value={s.py}
					onNumChange={(v) => patchStyle({ py: v })}
					tokenValue={tokenOrEmpty(s.py)}
					onTokenChange={(t) =>
						patchStyle({ py: t ? `token:${t}` : undefined })
					}
					tokenOptions={spacingOptions}
				/>
			</InspectorGrid>

			<InspectorGrid cols={2}>
				<NumRow
					label="padding-top"
					value={s.pt}
					onChange={(v) => patchStyle({ pt: v })}
				/>
				<NumRow
					label="padding-right"
					value={s.pr}
					onChange={(v) => patchStyle({ pr: v })}
				/>
				<NumRow
					label="padding-bottom"
					value={s.pb}
					onChange={(v) => patchStyle({ pb: v })}
				/>
				<NumRow
					label="padding-left"
					value={s.pl}
					onChange={(v) => patchStyle({ pl: v })}
				/>
			</InspectorGrid>

			<InspectorGrid cols={1} style={{ marginTop: 8 }}>
				<NumOrTokenRow
					label="margin"
					value={s.m}
					onNumChange={(v) => patchStyle({ m: v })}
					tokenValue={tokenOrEmpty(s.m)}
					onTokenChange={(t) =>
						patchStyle({ m: t ? `token:${t}` : undefined })
					}
					tokenOptions={spacingOptions}
				/>
			</InspectorGrid>

			<InspectorGrid cols={2}>
				<NumRow
					label="margin-x"
					value={s.mx as number | undefined}
					onChange={(v) => patchStyle({ mx: v })}
				/>
				<NumRow
					label="margin-y"
					value={s.my}
					onChange={(v) => patchStyle({ my: v })}
				/>
				<NumRow
					label="margin-top"
					value={s.mt}
					onChange={(v) => patchStyle({ mt: v })}
				/>
				<NumRow
					label="margin-right"
					value={s.mr}
					onChange={(v) => patchStyle({ mr: v })}
				/>
				<NumRow
					label="margin-bottom"
					value={s.mb}
					onChange={(v) => patchStyle({ mb: v })}
				/>
				<NumRow
					label="margin-left"
					value={s.ml}
					onChange={(v) => patchStyle({ ml: v })}
				/>
			</InspectorGrid>
		</InspectorSection>
	);
}