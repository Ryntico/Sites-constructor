import { InspectorSection } from '../InspectorSection.tsx';
import { NumRow } from '@components/constructor/Inspector/InspectorInputs/NumRow.tsx';
import { SelectRow } from '@components/constructor/Inspector/InspectorInputs/SelectRow.tsx';
import type { NodeJson } from '@/types/siteTypes.ts';

interface NumberInputInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
}

export function NumberInputInspector({ node, patchProps }: NumberInputInspectorProps) {
	const p = node.props || {};

	return (
		<InspectorSection title="Атрибуты числового поля">
			<NumRow
				label="Минимальное значение (min)"
				value={p.min}
				onChange={(v) => patchProps({ min: v })}
				title="Минимальное допустимое значение"
			/>

			<NumRow
				label="Максимальное значение (max)"
				value={p.max}
				onChange={(v) => patchProps({ max: v })}
				title="Максимальное допустимое значение"
			/>

			<NumRow
				label="Шаг изменения (step)"
				value={p.step}
				onChange={(v) => patchProps({ step: v })}
				title="Шаг изменения значения при нажатии стрелок"
			/>

			<SelectRow
				label="Автозаполнение (autocomplete)"
				value={p.autocomplete || 'off'}
				onChange={(v) => patchProps({ autocomplete: v })}
				options={[
					['off', 'Выключено'],
					['on', 'Включено'],
				]}
				title="Управление автозаполнением браузера"
			/>

			<SelectRow
				label="Режим ввода (inputmode)"
				value={p.inputmode || 'decimal'}
				onChange={(v) => patchProps({ inputmode: v })}
				options={[
					['decimal', 'Десятичные числа'],
					['numeric', 'Целые числа'],
				]}
				title="Управление режимом ввода браузера"
			/>
		</InspectorSection>
	);
}