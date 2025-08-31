import { InspectorSection } from '../InspectorSection';
import { SelectRow } from '@/dev/constructor/components/InspectorInputs/SelectRow';
import { TextRowWithValidate } from '@/dev/constructor/components/InspectorInputs/TextRowWithValidate';
import { CheckboxRow } from '@/dev/constructor/components/InspectorInputs/CheckboxRow';
import type { NodeJson } from '@/types/siteTypes';

interface InputInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
	parentNode?: NodeJson | null;
}

export function InputInspector({ node, patchProps, parentNode }: InputInspectorProps) {
	const p = node.props || {};

	return (
		<InspectorSection title="Атрибуты поля input">
			<SelectRow
				label="Тип"
				value={p.type || ''}
				onChange={(v) => patchProps({ type: v || undefined })}
				options={[
					['', '—'],
					['text', 'текст'],
					['password', 'пароль'],
					['email', 'email'],
					['number', 'число'],
					['checkbox', 'флажок'],
					['radio', 'переключатель'],
					['date', 'дата'],
					['time', 'время'],
					['week', 'неделя'],
					['month', 'месяц'],
					['color', 'цвет'],
					['range', 'ползунок'],
					['file', 'файл'],
					['url', 'ссылка'],
					['tel', 'номер телефона'],
					['submit', 'отправить данные формы'],
				]}
			/>

			<TextRowWithValidate
				label="name"
				value={p.name || ''}
				onChange={(v) => patchProps({ name: v })}
				title={
					p.type === 'radio'
						? 'Уникальное имя для группы переключателей. Должно быть одинаковым для всех переключателей в группе.'
						: 'Уникальный идентификатор поля для обработки формы на сервере и доступа к данным через JavaScript. Обязателен для отправки данных.'
				}
				required={true}
				validate={(value) => {
					if (value && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)) return;
					if (!value) return 'Поле обязательно для заполнения';
					return 'Пожалуйста, введите корректное имя латиницей';
				}}
			/>

			{parentNode?.type !== 'form' && (
				<TextRowWithValidate
					label="form"
					required
					value={p.formId || ''}
					onChange={(v) => patchProps({ formId: v })}
					title="ID формы, к которой должно принадлежать поле (если оно находится вне тега form)"
				/>
			)}

			{p.type === 'submit' && (
				<TextRowWithValidate
					label="текст кнопки"
					value={p.value || ''}
					onChange={(v) => patchProps({ value: v })}
				/>
			)}

			<TextRowWithValidate
				label="label"
				value={p.label || ''}
				title="Заголовок поля. Показывается над полем ввода."
				onChange={(v) => patchProps({ label: v })}
			/>

			<TextRowWithValidate
				label="placeholder"
				value={p.placeholder || ''}
				onChange={(v) => patchProps({ placeholder: v })}
				title="Подсказывающий текст, который отображается внутри поля ввода, когда оно пустое"
			/>

			<TextRowWithValidate
				label="title"
				value={p.title || ''}
				onChange={(v) => patchProps({ title: v })}
				title="Всплывающая подсказка, которая появляется при наведении на поле ввода"
			/>

			<div
				style={{ display: 'flex', padding: 8, gap: 8, flexWrap: 'wrap' }}
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
			</div>
		</InspectorSection>
	);
}