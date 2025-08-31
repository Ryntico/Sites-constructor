import type { NodeJson } from '@/types/siteTypes';

interface HeadingInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
}

export function HeadingInspector({ node, patchProps }: HeadingInspectorProps) {
	const p = node.props || {};

	return (
		<>
			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>Текст</div>
			<input
				style={{
					width: '100%',
					border: '1px solid #d0d3dc',
					borderRadius: 8,
					padding: '6px 8px',
					marginBottom: 10,
					fontSize: 13,
				}}
				value={p.text ?? ''}
				onChange={(e) => patchProps({ text: e.target.value })}
			/>

			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>Уровень (1–6)</div>
			<input
				type="number"
				min={1}
				max={6}
				style={{
					width: '100%',
					border: '1px solid #d0d3dc',
					borderRadius: 8,
					padding: '6px 8px',
					marginBottom: 10,
					fontSize: 13,
				}}
				value={p.level ?? 1}
				onChange={(e) => patchProps({ level: Number(e.target.value) })}
			/>
		</>
	);
}