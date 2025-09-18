import { useMemo, useState } from 'react';
import { RenderTree } from '@/components/constructor/render/Renderer.tsx';
import type { PageSchema, ThemeTokens } from '@/types/siteTypes.ts';
import { StyleReset } from '@/components/constructor/render/StyleReset.tsx';

const PRESETS = [
	{ key: 'desktop', label: 'Desktop', width: '100%' as const },
	{ key: 'tablet', label: 'Tablet', width: 768 as const },
	{ key: 'mobile', label: 'Mobile', width: 390 as const },
];
type PresetKey = (typeof PRESETS)[number]['key'];

export function PreviewPane({
	schema,
	theme,
}: {
	schema: PageSchema;
	theme: ThemeTokens;
}) {
	const [preset, setPreset] = useState<PresetKey>('desktop');

	const width = useMemo(() => {
		const p = PRESETS.find((x) => x.key === preset)!;
		return typeof p.width === 'number' ? `${p.width}px` : p.width;
	}, [preset]);

	return (
		<div style={{ display: 'grid', gap: 8 }}>
			<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
				<span style={{ fontSize: 12, color: '#687087' }}>Viewport:</span>
				{PRESETS.map((p) => (
					<button
						key={p.key}
						onClick={() => setPreset(p.key)}
						style={{
							padding: '6px 10px',
							borderRadius: 4,
							border: `1px solid #1970c1`,
							background: preset === p.key ? '#1970c1' : 'transparent',
							fontSize: 12,
							fontWeight: 1000,
							cursor: 'pointer',
							color: preset === p.key ? '#fdf4ed' : '#4da6cd',
						}}
					>
						{p.label}
					</button>
				))}
			</div>

			<div
				style={{
					border: '1px solid #e6e8ef',
					borderRadius: 12,
					background: '#fff',
					overflow: 'hidden',
				}}
			>
				<StyleReset theme={theme} />
				<div
					data-preview-root
					style={{
						width,
						margin: '0 auto',
						minHeight: 480,
						background: theme.colors.page,
						color: theme.colors.text.base,
						fontFamily:
							theme.typography?.fontFamily ??
							'system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica Neue,Arial,Noto Sans',
					}}
				>
					<RenderTree theme={theme} schema={schema} />
				</div>
			</div>
		</div>
	);
}
