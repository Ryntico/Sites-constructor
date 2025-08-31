import { InspectorSection } from '../InspectorSection';
import { TextRowWithValidate } from '@/dev/constructor/components/InspectorInputs/TextRowWithValidate';
import { CheckboxRow } from '@/dev/constructor/components/InspectorInputs/CheckboxRow';
import { NumRow } from '@/dev/constructor/components/InspectorInputs/NumRow';
import { SelectOptionsEditor } from '@/dev/constructor/components/SelectOptionsEditor.tsx';
import type { NodeJson } from '@/types/siteTypes';

interface SelectInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
	parentNode?: NodeJson | null;
}

export function SelectInspector({ node, patchProps, parentNode }: SelectInspectorProps) {
	const p = node.props || {};

	return (
		<InspectorSection title="Настройки Select">
			<TextRowWithValidate
				label="name"
				value={p.name ?? ''}
				onChange={(v) => patchProps({ name: v })}
				placeholder="Введите имя поля"
				validate={(value) => {
					if (!value.trim()) return 'Имя поля обязательно';
					if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
						return 'Имя должно содержать только латинские буквы, цифры и подчеркивания, и начинаться с буквы';
					}
					return undefined;
				}}
				title="Уникальный идентификатор поля для обработки формы на сервере и доступа к данным через JavaScript. Обязателен для отправки данных."
				required
			/>

			{parentNode?.type !== 'form' && (
				<TextRowWithValidate
					label="form"
					required
					value={p.formId ?? ''}
					onChange={(v) => patchProps({ formId: v })}
					title="ID формы, к которой относится это поле"
				/>
			)}

			<TextRowWithValidate
				label="label"
				value={p.label ?? ''}
				onChange={(v) => patchProps({ label: v })}
				placeholder="Введите подпись поля"
				title="Текст, который будет отображаться над полем"
			/>

			<InspectorSection title="Настройка опций для Select">
				<SelectOptionsEditor
					options={node.props?.options || []}
					onChange={(options) => patchProps({ options })}
				/>
			</InspectorSection>

			<div
				style={{ display: 'flex', padding: 8, flexWrap: 'wrap', gap: 8 }}
			>
				<CheckboxRow
					label="disabled"
					checked={!!p.disabled}
					onChange={(checked) =>
						patchProps({ disabled: checked || undefined })
					}
					title="Отключает поле ввода, делая его недоступным для взаимодействия"
				/>
				<CheckboxRow
					label="readonly"
					checked={!!p.readonly}
					onChange={(checked) =>
						patchProps({ readonly: checked || undefined })
					}
					title="Запрещает редактирование значения поля, но позволяет его выделять и копировать"
				/>
				<CheckboxRow
					label="autofocus"
					checked={!!p.autofocus}
					onChange={(checked) =>
						patchProps({ autofocus: checked || undefined })
					}
					title="Автоматически устанавливает фокус на это поле при загрузке страницы"
				/>
				<CheckboxRow
					label="required"
					checked={!!p.required}
					onChange={(checked) =>
						patchProps({ required: checked || undefined })
					}
					title="Поле обязательно для заполнения"
				/>
				<CheckboxRow
					label="multiple"
					checked={!!p.multiple}
					onChange={(checked) =>
						patchProps({ multiple: checked || undefined })
					}
					title="Множественный выбор"
				/>
			</div>

			<NumRow
				label="Размер списка"
				value={p.size}
				onChange={(v) => patchProps({ size: v })}
				title="Количество видимых опций в выпадающем списке"
			/>
		</InspectorSection>
	);
}