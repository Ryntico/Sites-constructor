import { ImageUploader } from '@/dev/constructor/components/ImageUploader';
import type { NodeJson } from '@/types/siteTypes';

interface ImageInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
	ownerId?: string;
}

export function ImageInspector({ node, patchProps, ownerId }: ImageInspectorProps) {
	const p = node.props || {};

	return (
		<>
			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>Src</div>
			<input
				style={{
					width: '100%',
					border: '1px solid #d0d3dc',
					borderRadius: 8,
					padding: '6px 8px',
					marginBottom: 10,
					fontSize: 13,
				}}
				value={p.src ?? ''}
				onChange={(e) => patchProps({ src: e.target.value })}
			/>

			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>Alt</div>
			<input
				style={{
					width: '100%',
					border: '1px solid #d0d3dc',
					borderRadius: 8,
					padding: '6px 8px',
					marginBottom: 10,
					fontSize: 13,
				}}
				value={p.alt ?? ''}
				onChange={(e) => patchProps({ alt: e.target.value })}
			/>

			<div style={{ display: 'grid', gap: 6 }}>
				<div style={{ fontSize: 12, color: '#687087' }}>
					Загрузить изображение
				</div>
				<ImageUploader
					ownerId={ownerId}
					onUploaded={(url) => {
						const next: Partial<NodeJson['props']> = { src: url };
						if (!p.alt) {
							try {
								const u = new URL(url);
								const name = decodeURIComponent(
									u.pathname.split('/').pop() || '',
								).split('?')[0];
								if (name) next.alt = name;
							} catch {
								// no-op
							}
						}
						patchProps(next);
					}}
				/>
			</div>
		</>
	);
}