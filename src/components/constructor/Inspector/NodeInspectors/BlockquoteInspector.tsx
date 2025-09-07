import type { NodeJson } from '@/types/siteTypes.ts';

interface BlockquoteInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
}

export function BlockquoteInspector({ node, patchProps }: BlockquoteInspectorProps) {
	const p = node.props || {};

	return (
		<>
			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>Текст цитаты</div>
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

			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>Текст перед автором</div>
			<input
				style={{
					width: '100%',
					border: '1px solid #d0d3dc',
					borderRadius: 8,
					padding: '6px 8px',
					marginBottom: 10,
					fontSize: 13,
				}}
				value={p.preAuthor ?? ''}
				onChange={(e) => patchProps({ preAuthor: e.target.value })}
			/>

			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>Автор</div>
			<input
				style={{
					width: '100%',
					border: '1px solid #d0d3dc',
					borderRadius: 8,
					padding: '6px 8px',
					marginBottom: 10,
					fontSize: 13,
				}}
				value={p.cite ?? ''}
				onChange={(e) => patchProps({ cite: e.target.value })}
			/>
		</>
	);
}