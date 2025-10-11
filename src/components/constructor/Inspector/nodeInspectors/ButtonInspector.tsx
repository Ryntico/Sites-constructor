import type { NodeJson } from '@/types/siteTypes.ts';

interface ButtonInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
}

export function ButtonInspector({ node, patchProps }: ButtonInspectorProps) {
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

			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>Ссылка (href)</div>
			<input
				style={{
					width: '100%',
					border: '1px solid #d0d3dc',
					borderRadius: 8,
					padding: '6px 8px',
					marginBottom: 10,
					fontSize: 13,
				}}
				value={p.href ?? ''}
				onChange={(e) => patchProps({ href: e.target.value })}
			/>
		</>
	);
}