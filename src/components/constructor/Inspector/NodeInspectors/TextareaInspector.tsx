import { InspectorSection } from '../InspectorSection.tsx';
import { TextRowWithValidate } from '@components/constructor/Inspector/InspectorInputs/TextRowWithValidate.tsx';
import { NumRow } from '@components/constructor/Inspector/InspectorInputs/NumRow.tsx';
import { CheckboxRow } from '@components/constructor/Inspector/InspectorInputs/CheckboxRow.tsx';
import { SelectRow } from '@components/constructor/Inspector/InspectorInputs/SelectRow.tsx';
import type { NodeJson } from '@/types/siteTypes.ts';

interface TextareaInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
	parentNode?: NodeJson | null;
}

export function TextareaInspector({ node, patchProps, parentNode }: TextareaInspectorProps) {
	const p = node.props || {};

	return (
		<InspectorSection title="Атрибуты текстовой области">
			<TextRowWithValidate
				label="name"
				value={p.name || ''}
				onChange={(v) => patchProps({ name: v })}
				title="Имя поля, которое будет отправлено на сервер с формой"
				required={true}
				validate={(value) =>
					!value ? 'Поле обязательно для заполнения' : undefined
				}
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
				value={p.label || ''}
				title="Заголовок поля. Показывается над полем ввода."
				onChange={(v) => patchProps({ label: v })}
			/>

			<NumRow
				label="Количество строк (rows)"
				value={p.rows}
				onChange={(v) => patchProps({ rows: v })}
				title="Высота текстовой области в строках текста"
			/>

			<NumRow
				label="Количество колонок (cols)"
				value={p.cols}
				onChange={(v) => patchProps({ cols: v })}
				title="Ширина текстовой области в символах"
			/>

			<TextRowWithValidate
				label="Плейсхолдер (placeholder)"
				value={p.placeholder || ''}
				onChange={(v) => patchProps({ placeholder: v })}
				title="Подсказывающий текст, который отображается, когда поле пустое"
			/>

			<TextRowWithValidate
				label="Подсказка (title)"
				value={p.title || ''}
				onChange={(v) => patchProps({ title: v })}
				title="Всплывающая подсказка при наведении на поле"
			/>

			<NumRow
				label="Максимальная длина (maxlength)"
				value={p.maxlength}
				onChange={(v) => patchProps({ maxlength: v })}
				title="Максимальное количество символов, которое можно ввести"
			/>

			<NumRow
				label="Минимальная длина (minlength)"
				value={p.minlength}
				onChange={(v) => patchProps({ minlength: v })}
				title="Минимальное количество символов, которое нужно ввести"
			/>

			<div
				style={{
					display: 'flex',
					gap: 8,
					flexWrap: 'wrap',
					marginTop: 8,
				}}
			>
				<CheckboxRow
					label="Отключено (disabled)"
					checked={!!p.disabled}
					onChange={(checked) =>
						patchProps({ disabled: checked || undefined })
					}
					title="Отключает поле, делая его недоступным для ввода"
				/>

				<CheckboxRow
					label="Только для чтения (readonly)"
					checked={!!p.readonly}
					onChange={(checked) =>
						patchProps({ readonly: checked || undefined })
					}
					title="Запрещает редактирование, но позволяет выделять и копировать текст"
				/>

				<CheckboxRow
					label="Обязательное поле (required)"
					checked={!!p.required}
					onChange={(checked) =>
						patchProps({ required: checked || undefined })
					}
					title="Поле должно быть заполнено перед отправкой формы"
				/>

				<CheckboxRow
					label="Автофокус (autofocus)"
					checked={!!p.autofocus}
					onChange={(checked) =>
						patchProps({ autofocus: checked || undefined })
					}
					title="Автоматически устанавливает фокус на это поле при загрузке страницы"
				/>

				<CheckboxRow
					label="Проверка орфографии (spellcheck)"
					checked={!!p.spellcheck}
					onChange={(checked) =>
						patchProps({ spellcheck: checked || undefined })
					}
					title="Включает или отключает проверку орфографии для этого поле"
				/>
			</div>

			<SelectRow
				label="Перенос текста (wrap)"
				value={p.wrap || 'soft'}
				onChange={(v) => patchProps({ wrap: v })}
				options={[
					['soft', 'Мягкий перенос (по умолчанию)'],
					['hard', 'Жесткий перенос'],
					['off', 'Без переноса'],
				]}
				title="Управляет переносом текста при отправке формы"
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
		</InspectorSection>
	);
}