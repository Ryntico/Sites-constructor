import React, { useMemo, useState } from 'react';
import type {
	PageSchema,
	ThemeTokens,
	StyleShortcuts,
	NodeJson,
} from '@/types/siteTypes';
import { isContainer } from '@/dev/constructor/ops/schemaOps.ts';
import { RichText } from '@/dev/constructor/components/RichText.tsx';
import { SelectOptionsEditor } from '@/dev/constructor/components/SelectOptionsEditor.tsx';
import { ImageUploader } from './components/ImageUploader';

type Props = {
	schema: PageSchema;
	selectedId: string | null;
	onChange(next: PageSchema): void;
	theme?: ThemeTokens;
	ownerId?: string;
};

// type BP = 'base' | 'sm' | 'md' | 'lg';

export function Inspector({ schema, selectedId, onChange, theme, ownerId }: Props) {
	// const [bp, setBp] = useState<BP>('base');
	const bp = 'base';
	const node = selectedId ? schema.nodes[selectedId] : null;
	const parentNode = node
		? Object.values(schema.nodes).find((n) => n.childrenOrder?.includes(node.id))
		: null;
	const p = node?.props || {};

	const patchProps = (patch: Partial<NodeJson['props']>) => {
		if (!node) return;
		onChange({
			...schema,
			nodes: {
				...schema.nodes,
				[node.id]: { ...node, props: { ...(node.props || {}), ...patch } },
			},
		});
	};

	const colorOptions = useMemo<[string, string][]>(() => {
		if (!theme) return [];
		return [
			['colors.page', theme.colors.page],
			['colors.surface', theme.colors.surface],
			['colors.border', theme.colors.border],
			['colors.text.base', theme.colors.text.base],
			['colors.text.muted', theme.colors.text.muted],
			['colors.text.onPrimary', theme.colors.text.onPrimary],
			['colors.primary.500', theme.colors.primary['500']],
			['colors.primary.600', theme.colors.primary['600']],
			['colors.primary.outline', theme.colors.primary.outline],
		];
	}, [theme]);

	const spacingOptions = useMemo<[string, string][]>(() => {
		if (!theme) return [];
		return Object.keys(theme.spacing).map((k) => [
			`spacing.${k}`,
			String(theme.spacing[k]),
		]);
	}, [theme]);

	const radiusOptions = useMemo<[string, string][]>(() => {
		if (!theme) return [];
		return Object.keys(theme.radius).map((k) => [
			`radius.${k}`,
			String(theme.radius[k]),
		]);
	}, [theme]);

	const shadowOptions = useMemo<[string, string][]>(() => {
		if (!theme) return [];
		return Object.keys(theme.shadow).map((k) => [`shadow.${k}`, theme.shadow[k]]);
	}, [theme]);

	if (!selectedId) return <div style={card}>Выберите элемент</div>;
	if (!node) return <div style={card}>Нет узла</div>;

	const patchStyle = (patch: Partial<StyleShortcuts>) => {
		const prev = node.props?.style ?? {};
		const cur = prev[bp] ?? {};
		const nextStyle = { ...prev, [bp]: { ...cur, ...patch } };
		onChange({
			...schema,
			nodes: {
				...schema.nodes,
				[node.id]: {
					...node,
					props: { ...(node.props || {}), style: nextStyle },
				},
			},
		});
	};

	const s = (p.style?.[bp] ?? {}) as StyleShortcuts;

	return (
		<div style={{ ...card, display: 'grid', gap: 12 }}>
			<div>
				<div style={{ fontWeight: 600, marginBottom: 4 }}>Инспектор</div>
				<div style={{ fontSize: 12, color: '#666' }}>{node.type}</div>
			</div>

			{node.type === 'richtext' && (
				<RichText value={p.text ?? ''} patchProps={patchProps} />
			)}

			{(node.type === 'heading' ||
				node.type === 'paragraph' ||
				node.type === 'button') && (
				<>
					<Label>Текст</Label>
					<input
						style={input}
						value={p.text ?? ''}
						onChange={(e) => patchProps({ text: e.target.value })}
					/>
				</>
			)}
			{node.type === 'blockquote' && (
				<>
					<Label>Текст цитаты</Label>
					<input
						style={input}
						value={p.text ?? ''}
						onChange={(e) => patchProps({ text: e.target.value })}
					/>
					<Label>Текст перед автором</Label>
					<input
						style={input}
						value={p.preAuthor ?? ''}
						onChange={(e) => patchProps({ preAuthor: e.target.value })}
					/>
					<Label>Автор</Label>
					<input
						style={input}
						value={p.cite ?? ''}
						onChange={(e) => patchProps({ cite: e.target.value })}
					/>
				</>
			)}

			{node.type === 'button' && (
				<>
					<Label>Ссылка (href)</Label>
					<input
						style={input}
						value={p.href ?? ''}
						onChange={(e) => patchProps({ href: e.target.value })}
					/>
				</>
			)}

			{node.type === 'heading' && (
				<>
					<Label>Уровень (1–6)</Label>
					<input
						type="number"
						min={1}
						max={6}
						style={input}
						value={p.level ?? 1}
						onChange={(e) => patchProps({ level: Number(e.target.value) })}
					/>
				</>
			)}

			{node.type === 'image' && (
				<>
					<Label>Src</Label>
					<input
						style={input}
						value={p.src ?? ''}
						onChange={(e) => patchProps({ src: e.target.value })}
					/>
					<Label>Alt</Label>
					<input
						style={input}
						value={p.alt ?? ''}
						onChange={(e) => patchProps({ alt: e.target.value })}
					/>
					<div style={{ display: 'grid', gap: 6 }}>
						<div style={{ fontSize: 12, color: '#687087' }}>
							Загрузить изображение
						</div>
						<ImageUploader
							ownerId={ownerId}
							onUploaded={(url) => {
								const next: Partial<NodeJson['props']> = { src: url };
								if (!p.alt) {
									try {
										const u = new URL(url);
										const name = decodeURIComponent(
											u.pathname.split('/').pop() || '',
										).split('?')[0];
										if (name) next.alt = name;
									} catch {
										// no-op
									}
								}
								patchProps(next);
							}}
						/>
					</div>
				</>
			)}

			{/*<div style={{ display: 'flex', gap: 6, marginTop: 6 }}>*/}
			{/*	{(['base', 'sm', 'md', 'lg'] as BP[]).map((b) => (*/}
			{/*		<button*/}
			{/*			key={b}*/}
			{/*			onClick={() => setBp(b)}*/}
			{/*			style={{*/}
			{/*				...chip,*/}
			{/*				background: bp === b ? '#eef2ff' : '#fff',*/}
			{/*				borderColor: bp === b ? '#c7d2fe' : '#d0d3dc',*/}
			{/*			}}*/}
			{/*		>*/}
			{/*			{b}*/}
			{/*		</button>*/}
			{/*	))}*/}
			{/*</div>*/}

			{node.type === 'form' && (
				<Section title="Настройки формы">
					<TextRowWithValidate
						label="ID формы"
						title="уникальный идентификатор формы на странице"
						value={p.formId || ''}
						onChange={(v) => patchProps({ formId: v })}
						validate={(value) => {
							if (!value) return;
							if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value))
								return 'ID может содержать только латинские буквы, цифры, дефис и подчеркивание.';
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
				</Section>
			)}

			{node.type === 'textarea' && (
				<Section title="Атрибуты текстовой области">
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
							title="Включает или отключает проверку орфографии для этого поля"
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
				</Section>
			)}

			{node.type === 'select' && (
				<Section title="Настройки Select">
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

					<Section title="Настройка опций для Select">
						<SelectOptionsEditor
							options={node.props?.options || []}
							onChange={(options) => patchProps({ options })}
						/>
					</Section>

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
				</Section>
			)}

			{node.type === 'input' && (
				<Section title="Атрибуты поля input">
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
				</Section>
			)}

			{p.type === 'number' && (
				<Section title="Атрибуты числового поля">
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
				</Section>
			)}

			{p.type === 'range' && (
				<Section title="Настройки ползунка">
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
				</Section>
			)}

			{['text', 'password', 'search', 'email', 'tel', 'url'].includes(
				p.type as string,
			) && (
				<Section title="Атрибуты текстового поля input">
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
				</Section>
			)}

			{isContainer(node) && (
				<Section title="Настройки блока">
					<Grid cols={3}>
						<SelectRow
							label="display"
							value={s.display ?? ''}
							onChange={(v) => patchStyle({ display: v || undefined })}
							options={[
								['', '—'],
								['block', 'block'],
								['flex', 'flex'],
								['inline-flex', 'inline-flex'],
								['grid', 'grid'],
							]}
						/>

						{s.display === 'flex' && (
							<SelectRow
								label="direction"
								value={s.flexDirection ?? ''}
								onChange={(v) =>
									patchStyle({ flexDirection: v || undefined })
								}
								options={[
									['', '—'],
									['row', 'row'],
									['row-reverse', 'row-reverse'],
									['column', 'column'],
									['column-reverse', 'column-reverse'],
								]}
							/>
						)}
						{s.display === 'flex' && (
							<SelectRow
								label="flex-wrap"
								value={s.wrap ?? ''}
								onChange={(v) => patchStyle({ wrap: v || undefined })}
								options={[
									['', '—'],
									['nowrap', 'nowrap'],
									['wrap', 'wrap'],
									['wrap-reverse', 'wrap-reverse'],
								]}
							/>
						)}
					</Grid>
				</Section>
			)}

			{s.display === 'flex' && isContainer(node) && (
				<Section>
					<Grid cols={3}>
						<SelectRow
							label="align-items"
							value={s.items ?? ''}
							onChange={(v) => patchStyle({ items: v || undefined })}
							options={[
								['', '—'],
								['start', 'start'],
								['center', 'center'],
								['end', 'end'],
								['baseline', 'baseline'],
								['stretch', 'stretch'],
							]}
						/>
						<SelectRow
							label="justify-content"
							value={s.justify ?? ''}
							onChange={(v) => patchStyle({ justify: v || undefined })}
							options={[
								['', '—'],
								['start', 'start'],
								['center', 'center'],
								['end', 'end'],
								['between', 'between'],
								['around', 'around'],
								['evenly', 'evenly'],
							]}
						/>
					</Grid>
				</Section>
			)}

			{parentNode?.props?.style?.[bp]?.display === 'flex' && (
				<Section title="Свойства флекс элементов">
					<Grid cols={2}>
						<SelectRow
							label="align-self"
							value={s.alignSelf ?? ''}
							onChange={(v) => patchStyle({ alignSelf: v })}
							options={[
								['', '—'],
								['start', 'start'],
								['center', 'center'],
								['end', 'end'],
								['baseline', 'baseline'],
								['stretch', 'stretch'],
							]}
						/>
						<NumRow
							label="order"
							value={s.order}
							onChange={(v) => patchStyle({ order: processOrder(v) })}
						/>
						<SelectRow
							label="flex-grow"
							value={s.flexGrow ?? ''}
							onChange={(v) => patchStyle({ flexGrow: v })}
							options={[
								['', '—'],
								['1', '1'],
								['0', '0'],
							]}
						/>
						<SelectRow
							label="flex-shrink"
							value={s.flexShrink ?? ''}
							onChange={(v) => patchStyle({ flexShrink: v })}
							options={[
								['', '—'],
								['1', '1'],
								['0', '0'],
							]}
						/>
					</Grid>
				</Section>
			)}

			<Section title="Размеры (по умолчанию: 100%)">
				<Grid cols={2} style={{ marginTop: 8 }}>
					<TextRow
						label="ширина"
						value={toStr(s.w)}
						onChange={(v) => patchStyle({ w: processSizeValue(v) })}
						placeholder="число(px)"
					/>
					<TextRow
						label="высота"
						value={toStr(s.h)}
						onChange={(v) => patchStyle({ h: processSizeValue(v) })}
						placeholder="число(px)"
					/>
					<TextRow
						label="макс. ширина"
						value={toStr(s.maxW)}
						onChange={(v) => patchStyle({ maxW: processSizeValue(v) })}
						placeholder="число(px)"
					/>
					<TextRow
						label="макс. высота"
						value={toStr(s.maxH)}
						onChange={(v) => patchStyle({ maxH: processSizeValue(v) })}
						placeholder="число(px)"
					/>
				</Grid>
			</Section>

			<Section title="Отступы">
				{s.display === 'flex' && (
					<Grid cols={1}>
						<NumOrTokenRow
							label="gap (промежутки)"
							value={s.gap}
							onNumChange={(v) => patchStyle({ gap: v })}
							tokenValue={tokenOrEmpty(s.gap)}
							onTokenChange={(tok) =>
								patchStyle({ gap: tok ? `token:${tok}` : undefined })
							}
							tokenOptions={spacingOptions}
						/>
					</Grid>
				)}

				<Grid cols={1}>
					<NumOrTokenRow
						label="padding"
						value={s.p}
						onNumChange={(v) => patchStyle({ p: v })}
						tokenValue={tokenOrEmpty(s.p)}
						onTokenChange={(t) =>
							patchStyle({ p: t ? `token:${t}` : undefined })
						}
						tokenOptions={spacingOptions}
					/>
					<NumOrTokenRow
						label="padding-x"
						value={s.px}
						onNumChange={(v) => patchStyle({ px: v })}
						tokenValue={tokenOrEmpty(s.px)}
						onTokenChange={(t) =>
							patchStyle({ px: t ? `token:${t}` : undefined })
						}
						tokenOptions={spacingOptions}
					/>
					<NumOrTokenRow
						label="padding-y"
						value={s.py}
						onNumChange={(v) => patchStyle({ py: v })}
						tokenValue={tokenOrEmpty(s.py)}
						onTokenChange={(t) =>
							patchStyle({ py: t ? `token:${t}` : undefined })
						}
						tokenOptions={spacingOptions}
					/>
				</Grid>
				<Grid cols={2}>
					<NumRow
						label="padding-top"
						value={s.pt}
						onChange={(v) => patchStyle({ pt: v })}
					/>
					<NumRow
						label="padding-right"
						value={s.pr}
						onChange={(v) => patchStyle({ pr: v })}
					/>
					<NumRow
						label="padding-bottom"
						value={s.pb}
						onChange={(v) => patchStyle({ pb: v })}
					/>
					<NumRow
						label="padding-left"
						value={s.pl}
						onChange={(v) => patchStyle({ pl: v })}
					/>
				</Grid>

				<Grid cols={1} style={{ marginTop: 8 }}>
					<NumOrTokenRow
						label="margin"
						value={s.m}
						onNumChange={(v) => patchStyle({ m: v })}
						tokenValue={tokenOrEmpty(s.m)}
						onTokenChange={(t) =>
							patchStyle({ m: t ? `token:${t}` : undefined })
						}
						tokenOptions={spacingOptions}
					/>
				</Grid>
				<Grid cols={2}>
					<NumRow
						label="margin-x"
						value={s.mx as number | undefined}
						onChange={(v) => patchStyle({ mx: v })}
					/>
					<NumRow
						label="margin-y"
						value={s.my}
						onChange={(v) => patchStyle({ my: v })}
					/>
					<NumRow
						label="margin-top"
						value={s.mt}
						onChange={(v) => patchStyle({ mt: v })}
					/>
					<NumRow
						label="margin-right"
						value={s.mr}
						onChange={(v) => patchStyle({ mr: v })}
					/>
					<NumRow
						label="margin-bottom"
						value={s.mb}
						onChange={(v) => patchStyle({ mb: v })}
					/>
					<NumRow
						label="margin-left"
						value={s.ml}
						onChange={(v) => patchStyle({ ml: v })}
					/>
				</Grid>
			</Section>

			<Section title="Цвета / фон / границы">
				<Grid cols={3}>
					<ColorTokenRow
						label="цвет фона"
						value={toStr(s.bg)}
						onText={(v) => patchStyle({ bg: emptyToUndef(v) })}
						tokenValue={tokenOrEmpty(s.bg)}
						onTokenChange={(tok) =>
							patchStyle({ bg: tok ? `token:${tok}` : undefined })
						}
						options={colorOptions}
					/>
					<ColorTokenRow
						label="цвет текста"
						value={toStr(s.color)}
						onText={(v) => patchStyle({ color: emptyToUndef(v) })}
						tokenValue={tokenOrEmpty(s.color)}
						onTokenChange={(tok) =>
							patchStyle({
								color: tok ? `token:${tok}` : undefined,
							})
						}
						options={colorOptions}
					/>
					<ColorTokenRow
						label="цвет границы"
						value={toStr(s.borderColor)}
						onText={(v) => patchStyle({ borderColor: emptyToUndef(v) })}
						tokenValue={tokenOrEmpty(s.borderColor)}
						onTokenChange={(tok) =>
							patchStyle({
								borderColor: tok ? `token:${tok}` : undefined,
							})
						}
						options={colorOptions}
					/>
				</Grid>
			</Section>

			<Section title="Декор">
				<Grid cols={1}>
					<TokenOnlyRow
						label="радиус границ"
						currentValue={tokenOrEmpty(s.radius)}
						onTokenChange={(tok) =>
							patchStyle({
								radius: tok ? `token:${tok}` : undefined,
							})
						}
						options={radiusOptions}
						allowManualNumber
						manualValue={isNumberLike(s.radius) ? String(s.radius) : ''}
						onManualChange={(v) =>
							patchStyle({ radius: v === '' ? undefined : Number(v) || 0 })
						}
					/>
					<TokenOnlyRow
						label="тень"
						currentValue={tokenOrEmpty(s.shadow)}
						onTokenChange={(tok) =>
							patchStyle({
								shadow: tok ? `token:${tok}` : undefined,
							})
						}
						options={shadowOptions}
					/>
					<SelectRow
						label="выравнивание текста"
						value={s.textAlign ?? ''}
						onChange={(v) => patchStyle({ textAlign: v || undefined })}
						options={[
							['', '—'],
							['left', 'left'],
							['center', 'center'],
							['right', 'right'],
						]}
					/>
				</Grid>
			</Section>
		</div>
	);
}

const card: React.CSSProperties = {
	// border: '1px solid #e6e8ef',
	// borderRadius: 12,
	padding: 12,
	background: '#fff',
};

const input: React.CSSProperties = {
	width: '100%',
	border: '1px solid #d0d3dc',
	borderRadius: 8,
	padding: '6px 8px',
	marginBottom: 10,
	fontSize: 13,
};

// const chip: React.CSSProperties = {
// 	padding: '4px 8px',
// 	border: '1px solid #d0d3dc',
// 	borderRadius: 999,
// 	background: '#fff',
// 	fontSize: 12,
// 	cursor: 'pointer',
// };

function Label({ children }: { children: React.ReactNode }) {
	return (
		<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>
			{children}
		</div>
	);
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
	return (
		<div style={{ borderTop: '1px solid #eef1f6', paddingTop: 10 }}>
			<div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
			{children}
		</div>
	);
}

function Grid({
	cols = 2,
	children,
	style,
}: {
	cols?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<div
			style={{
				display: 'grid',
				gap: 8,
				gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
				...(style || {}),
			}}
		>
			{children}
		</div>
	);
}

function SelectRow({
	label,
	value,
	onChange,
	options,
	disabled,
	title,
}: {
	label: string;
	value: string | number;
	onChange: (v: string) => void;
	options: [string, string][];
	disabled?: boolean;
	title?: string;
}) {
	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
			<span style={{ color: '#687087' }}>{label}</span>
			<select
				style={{ ...input, marginBottom: 0 }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				title={title}
			>
				{options.map(([val, label]) => (
					<option key={val + label} value={val}>
						{label}
					</option>
				))}
			</select>
		</label>
	);
}

function TextRow({
	label,
	value,
	onChange,
	placeholder,
	title,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	title?: string;
}) {
	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12, position: 'relative' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<span style={{ color: '#687087' }}>{label}</span>
				{title && <span style={{ fontSize: 12, color: '#687087' }}>{title}</span>}
			</div>
			<input
				style={{ ...input, marginBottom: 0 }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
			/>
		</label>
	);
}

function TextRowWithValidate({
	label,
	value,
	onChange,
	placeholder,
	error,
	validate,
	helperText,
	title,
	required,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	error?: string;
	validate?: (value: string) => string | undefined;
	helperText?: string;
	title?: string;
	required?: boolean;
}) {
	const [localError, setLocalError] = useState<string | undefined>();
	const [isDirty, setIsDirty] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		onChange(newValue);
		if (!isDirty) setIsDirty(true);
		if (validate) {
			setLocalError(validate(newValue));
		}
	};

	const handleBlur = () => {
		if (!isDirty) setIsDirty(true);
		if (validate) {
			setLocalError(validate(value));
		}
	};

	const displayError = isDirty && (error || localError);

	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12, position: 'relative' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<span style={{ color: '#687087' }}>
					{label}
					{required && (
						<span
							style={{ color: '#ff4d4f', marginLeft: 4, fontWeight: 1000 }}
						>
							*
						</span>
					)}
				</span>
			</div>
			<input
				style={{
					...input,
					marginBottom: 0,
					border: displayError ? '1px solid rgb(255, 77, 79)' : input.border,
					padding: '8px 12px',
				}}
				value={value}
				onChange={handleChange}
				onBlur={handleBlur}
				placeholder={placeholder}
				{...(required && { required })}
				title={title}
			/>
			{displayError ? (
				<div
					style={{
						color: '#ff4d4f',
						fontSize: 11,
						marginTop: 2,
						lineHeight: 1.2,
					}}
				>
					{displayError}
				</div>
			) : (
				helperText && (
					<div
						style={{
							color: '#687087',
							fontSize: 11,
							marginTop: 2,
							lineHeight: 1.2,
							fontStyle: 'italic',
						}}
					>
						{helperText}
					</div>
				)
			)}
		</label>
	);
}

function NumberRow({
	label,
	value,
	onChange,
	disabled,
	title,
}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	disabled?: boolean;
	title?: string;
}) {
	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
			<span style={{ color: '#687087' }}>{label}</span>
			<input
				type="number"
				style={{ ...input, marginBottom: 0 }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				title={title}
			/>
		</label>
	);
}

function NumRow({
	label,
	value,
	onChange,
	title,
}: {
	label: string;
	value: number | undefined;
	onChange: (v: number | undefined) => void;
	title?: string;
}) {
	return (
		<NumberRow
			label={label}
			value={toNumStr(value)}
			onChange={(v) => onChange(strToNumOrUndef(v))}
			title={title}
		/>
	);
}

function NumOrTokenRow({
	label,
	value,
	onNumChange,
	tokenValue,
	onTokenChange,
	tokenOptions,
}: {
	label: string;
	value: number | string | undefined;
	onNumChange: (v: number | undefined) => void;
	tokenValue: string;
	onTokenChange: (tok: string) => void;
	tokenOptions: [string, string][];
}) {
	const isTok = typeof value === 'string' && value.startsWith('token:');
	return (
		<div>
			<Label>{label}</Label>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
				<input
					type="number"
					style={{ ...input, marginBottom: 0 }}
					value={isTok ? '' : toNumStr(value as number | undefined)}
					onChange={(e) => onNumChange(strToNumOrUndef(e.target.value))}
					placeholder="px"
					disabled={isTok}
				/>
				<TokenSelect
					value={tokenValue}
					onChange={(tok) => onTokenChange(tok === '__none__' ? '' : tok)}
					options={tokenOptions}
					placeholder="token: spacing.*"
				/>
			</div>
		</div>
	);
}

function ColorTokenRow({
	label,
	value,
	onText,
	tokenValue,
	onTokenChange,
	options,
}: {
	label: string;
	value: string;
	onText: (v: string) => void;
	tokenValue: string;
	onTokenChange: (tok: string) => void;
	options: [string, string][];
}) {
	const isTok = tokenValue !== '';
	return (
		<div>
			<Label>{label}</Label>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
				<input
					type="color"
					value={isTok ? '' : value}
					onChange={(e) => onText(e.target.value)}
					disabled={isTok}
				/>
				<TokenSelect
					value={tokenValue}
					onChange={(tok) => onTokenChange(tok === '__none__' ? '' : tok)}
					options={options}
					placeholder="token: colors.*"
				/>
			</div>
		</div>
	);
}

function TokenOnlyRow({
	label,
	currentValue,
	onTokenChange,
	options,
	allowManualNumber,
	manualValue,
	onManualChange,
}: {
	label: string;
	currentValue: string;
	onTokenChange: (tok: string) => void;
	options: [string, string][];
	allowManualNumber?: boolean;
	manualValue?: string;
	onManualChange?: (v: string) => void;
}) {
	return (
		<div>
			<Label>{label}</Label>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: allowManualNumber ? '1fr 1fr' : '1fr',
					gap: 6,
				}}
			>
				{allowManualNumber && (
					<input
						type="number"
						style={{ ...input, marginBottom: 0 }}
						value={manualValue ?? ''}
						onChange={(e) => onManualChange?.(e.target.value)}
						placeholder="число(px)"
					/>
				)}
				<TokenSelect
					value={currentValue}
					onChange={(tok) => onTokenChange(tok === '__none__' ? '' : tok)}
					options={options}
					placeholder={`token: ${label}.*`}
				/>
			</div>
		</div>
	);
}

function TokenSelect({
	value,
	onChange,
	options,
	placeholder,
}: {
	value: string;
	onChange: (tok: string) => void;
	options: [string, string][];
	placeholder?: string;
}) {
	return (
		<select
			style={{ ...input, marginBottom: 0 }}
			value={value}
			onChange={(e) => onChange(e.target.value)}
		>
			<option value="">{placeholder ?? '—'}</option>
			{options.map(([key, label]) => (
				<option key={key} value={key}>
					token:{key} {` (${label})`}
				</option>
			))}
			<option value="__none__">Очистить</option>
		</select>
	);
}

function toNumStr(v: number | string | undefined): string {
	if (typeof v === 'number') return String(v);
	if (typeof v === 'string') {
		const n = Number(v);
		return Number.isFinite(n) ? String(n) : '';
	}
	return '';
}

function toStr(v: number | string | undefined): string {
	return v == null ? '' : String(v);
}

function strToNumOrUndef(s: string): number | undefined {
	const n = Number(s);
	return Number.isFinite(n) ? n : undefined;
}

/**
 * Processes a size value from an input field
 * - Empty string → undefined
 * - Numeric string → number
 * - Other strings (like '100%') → string
 */
function processSizeValue(value: string): number | string | undefined {
	const trimmed = value.trim();
	if (trimmed === '') return undefined;

	const num = Number(trimmed);
	if (!isNaN(num) && trimmed === num.toString()) {
		return num;
	}

	return trimmed;
}

function emptyToUndef(s: string): string | undefined {
	return s.trim() === '' ? undefined : s;
}

const processOrder = (v: number | undefined): number | undefined => {
	if (v === undefined) return undefined;
	return Number.isFinite(v) ? v : 0;
};

function tokenOrEmpty(v: unknown): string {
	return typeof v === 'string' && v.startsWith('token:')
		? v.replace(/^token:/, '')
		: '';
}

function isNumberLike(v: unknown) {
	return typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)));
}

function CheckboxRow({
	label,
	checked,
	onChange,
	title,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	title?: string;
}) {
	return (
		<label
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 4,
				fontSize: 14,
				color: '#4a4a4a',
				cursor: 'pointer',
			}}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				style={{ margin: 0 }}
				title={title}
			/>
			{label}
		</label>
	);
}
