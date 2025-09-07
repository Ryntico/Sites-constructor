import { InspectorSection } from '../InspectorSection.tsx';
import { TextRowWithValidate } from '@components/constructor/Inspector/InspectorInputs/TextRowWithValidate.tsx';
import { NumRow } from '@components/constructor/Inspector/InspectorInputs/NumRow.tsx';
import { SelectRow } from '@components/constructor/Inspector/InspectorInputs/SelectRow.tsx';
import type { NodeJson } from '@/types/siteTypes.ts';

interface TextInputInspectorProps {
	node: NodeJson;
	patchProps: (patch: Partial<NodeJson['props']>) => void;
}

export function TextInputInspector({ node, patchProps }: TextInputInspectorProps) {
	const p = node.props || {};

	return (
		<InspectorSection title="Атрибуты текстового поля input">
			<TextRowWithValidate
				label="Шаблон (pattern)"
				value={p.pattern || ''}
				onChange={(v) => patchProps({ pattern: v })}
				title="Регулярное выражение, которому должно соответствовать значение поля"
				placeholder="[A-Za-z]{3}"
			/>

			<NumRow
				label="Минимальная длина (minlength)"
				value={p.minlength}
				onChange={(v) => patchProps({ minlength: v })}
				title="Минимальное количество символов, которое можно ввести"
			/>

			<NumRow
				label="Максимальная длина (maxlength)"
				value={p.maxlength}
				onChange={(v) => patchProps({ maxlength: v })}
				title="Максимальное количество символов, которое можно ввести"
			/>

			<NumRow
				label="Размер (size)"
				value={p.size}
				onChange={(v) => patchProps({ size: v })}
				title="Ширина поля в символах"
			/>

			<SelectRow
				label="Автозаполнение (autocomplete)"
				value={p.autocomplete || 'off'}
				onChange={(v) => patchProps({ autocomplete: v })}
				options={[
					['off', 'Выключено'],
					['on', 'Включено'],
					['username', 'Имя пользователя'],
					['email', 'Email'],
					['current-password', 'Текущий пароль'],
					['new-password', 'Новый пароль'],
				]}
				title="Управление автозаполнением браузера"
			/>

			<SelectRow
				label="Режим ввода (inputmode)"
				value={p.inputmode || 'text'}
				onChange={(v) => patchProps({ inputmode: v })}
				options={[
					['text', 'Текст'],
					['decimal', 'Десятичные числа'],
					['numeric', 'Числа'],
					['tel', 'Телефон'],
					['search', 'Поиск'],
					['email', 'Email'],
					['url', 'URL'],
				]}
				title="Управление режимом ввода браузера"
			/>

			<SelectRow
				label="Проверка орфографии (spellcheck)"
				value={p.spellcheck?.toString() || 'default'}
				onChange={(v) =>
					patchProps({
						spellcheck:
							v === 'true'
								? true
								: v === 'false'
									? false
									: undefined,
					})
				}
				options={[
					['default', 'По умолчанию'],
					['true', 'Включить'],
					['false', 'Выключить'],
				]}
				title="Включение/отключение проверки орфографии"
			/>

			<SelectRow
				label="Направление текста (dir)"
				value={p.dir || 'auto'}
				onChange={(v) => patchProps({ dir: v })}
				options={[
					['auto', 'Авто'],
					['ltr', 'Слева направо'],
					['rtl', 'Справа налево'],
				]}
				title="Направление текста в поле ввода"
			/>
		</InspectorSection>
	);
}