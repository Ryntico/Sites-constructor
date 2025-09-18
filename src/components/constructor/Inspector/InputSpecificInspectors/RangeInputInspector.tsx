import { InspectorSection } from '../InspectorSection.tsx';
import { NumRow } from '@/components/constructor/Inspector/InspectorInputs/NumRow.tsx';
import type { NodeJson } from '@/types/siteTypes.ts';

interface RangeInputInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
}

export function RangeInputInspector({ node, patchProps }: RangeInputInspectorProps) {
	const p = node.props || {};

	return (
		<InspectorSection title="Настройки ползунка">
			<NumRow
				label="Минимальное значение (min)"
				value={p.min}
				onChange={(v) => patchProps({ min: v })}
				title="Минимальное значение ползунка"
			/>

			<NumRow
				label="Максимальное значение (max)"
				value={p.max}
				onChange={(v) => patchProps({ max: v })}
				title="Максимальное значение ползунка"
			/>

			<NumRow
				label="Шаг изменения (step)"
				value={p.step}
				onChange={(v) => patchProps({ step: v })}
				title="Шаг изменения значения при перемещении ползунка"
			/>
		</InspectorSection>
	);
}