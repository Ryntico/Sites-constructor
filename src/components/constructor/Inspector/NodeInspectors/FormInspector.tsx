import { InspectorSection } from '../InspectorSection.tsx';
import { TextRowWithValidate } from '@/components/constructor/Inspector/InspectorInputs/TextRowWithValidate.tsx';
import { SelectRow } from '@/components/constructor/Inspector/InspectorInputs/SelectRow.tsx';
import type { NodeJson } from '@/types/siteTypes.ts';

interface FormInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
}

export function FormInspector({ node, patchProps }: FormInspectorProps) {
	const p = node.props || {};

	return (
		<InspectorSection title="Настройки формы">
			<TextRowWithValidate
				label="ID формы"
				title="уникальный идентификатор формы на странице"
				value={p.formId || ''}
				onChange={(v) => patchProps({ formId: v })}
				validate={(value) => {
					if (!value) return;
					if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value))
						return 'ID может содержать только латинские буквы, цифры, дефис и подчеркивание.';
					if (document.querySelectorAll(`#${value}`).length > 0 &&
						document.querySelector(`[data-res-id="${node.id}"]`) !==
						document.querySelector(`#${value}`))
						return 'ID должен быть уникальным. Данный ID уже используется. Измените ID, иначе форма может работать некорректно';
				}}
			/>
			<SelectRow
				label="Метод формы"
				value={p.formMethod || ''}
				onChange={(v) => patchProps({ formMethod: v || undefined })}
				options={[
					['', '—'],
					['get', 'GET'],
					['post', 'POST'],
				]}
			/>
			<SelectRow
				label="Кодирование данных"
				value={p.enctype || ''}
				onChange={(v) => patchProps({ enctype: v || undefined })}
				options={[
					['', '—'],
					[
						'application/x-www-form-urlencoded',
						'application/x-www-form-urlencoded',
					],
					['multipart/form-data', 'multipart/form-data'],
					['text/plain', 'text/plain'],
				]}
			/>
			<TextRowWithValidate
				label="Куда отправляем данные"
				value={p.formAction || ''}
				onChange={(v) => patchProps({ formAction: v })}
				placeholder="https://example.com/api/endpoint"
				validate={(value) => {
					if (!value) return;
					try {
						new URL(value);
						return;
					} catch {
						return 'Пожалуйста, введите корректный URL (например: https://example.com)';
					}
				}}
			/>
		</InspectorSection>
	);
}