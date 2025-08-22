import React, { useMemo, useState } from 'react';
import type { PageSchema, ThemeTokens, StyleShortcuts } from '@/types/siteTypes';
import { isContainer } from '@/dev/constructor/runtime/schemaOps.ts';
import { RichText } from '@/dev/constructor/components/RichText.tsx';

type Props = {
	schema : PageSchema;
	selectedId : string | null;
	onChange(next : PageSchema) : void;
	theme? : ThemeTokens;
};

type BP = 'base' | 'sm' | 'md' | 'lg';

export function Inspector({ schema, selectedId, onChange, theme } : Props) {
	const [bp, setBp] = useState<BP>('base');
	const node = selectedId ? schema.nodes[selectedId] : null;
	const parentNode = node
		? Object.values(schema.nodes).find((n) =>
			n.childrenOrder?.includes(node.id))
		: null;
	const p = (node?.props || {}) as any;

	const patchProps = (patch: any) => {
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

	const patchStyle = (patch : Partial<StyleShortcuts>) => {
		const prev = node.props?.style ?? {};
		const cur = (prev as any)[bp] ?? {};
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
				<RichText
					value={p.text ?? ''}
					patchProps={patchProps}
				/>
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
				</>
			)}

			<div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
				{(['base', 'sm', 'md', 'lg'] as BP[]).map((b) => (
					<button
						key={b}
						onClick={() => setBp(b)}
						style={{
							...chip,
							background: bp === b ? '#eef2ff' : '#fff',
							borderColor: bp === b ? '#c7d2fe' : '#d0d3dc',
						}}
					>
						{b}
					</button>
				))}
			</div>

			{node.type === 'form' &&
				<Section title="Настройки формы">
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
							['application/x-www-form-urlencoded', 'application/x-www-form-urlencoded'],
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
							} catch (e) {
								return 'Пожалуйста, введите корректный URL (например: https://example.com)';
							}
						}}
					/>

				</Section>
			}

			{node.type === 'input' &&
				<Section title="Настройки поля ввода">
					<SelectRow
						label="Тип"
						value={p.type || ''}
						onChange={(v) => patchProps({ type: v || undefined })}
						options={[
							['', '—'],
							['text', 'text'],
							['password', 'password'],
							['email', 'email'],
							['number', 'number'],
							['checkbox', 'checkbox'],
							['radio', 'radio'],
							['date', 'date'],
							['time', 'time'],
							['color', 'color'],
							['range', 'range'],
							['file', 'file'],
							['url', 'url'],
							['tel', 'tel'],
						]}
					/>
				</Section>
			}

			{isContainer(node) &&
				<Section title="Настройки блока">
					<Grid cols={3}>
						<SelectRow
							label="display"
							value={s.display ?? ''}
							onChange={(v) => patchStyle({ display: (v || undefined) as any })}
							options={[
								['', '—'],
								['block', 'block'],
								['flex', 'flex'],
								['inline-flex', 'inline-flex'],
								['grid', 'grid'],
							]}
						/>


						{s.display === 'flex' &&
							<SelectRow
								label="direction"
								value={s.flexDirection ?? ''}
								onChange={(v) => patchStyle({ flexDirection: (v || undefined) as any })}
								options={[
									['', '—'],
									['row', 'row'],
									['row-reverse', 'row-reverse'],
									['column', 'column'],
									['column-reverse', 'column-reverse'],
								]}
							/>}
						{s.display === 'flex' &&
							<SelectRow
								label="flex-wrap"
								value={s.wrap ?? ''}
								onChange={(v) => patchStyle({ wrap: (v || undefined) as any })}
								options={[
									['', '—'],
									['nowrap', 'nowrap'],
									['wrap', 'wrap'],
									['wrap-reverse', 'wrap-reverse'],
								]}
							/>
						}
					</Grid>
				</Section>
			}

			{s.display === 'flex' && isContainer(node) &&
				<Section>
					<Grid cols={3}>
						<SelectRow
							label="align-items"
							value={s.items ?? ''}
							onChange={(v) => patchStyle({ items: (v || undefined) as any })}
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
							onChange={(v) => patchStyle({ justify: (v || undefined) as any })}
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
			}

			{parentNode?.props?.style?.[bp].display === 'flex' &&
				<Section title="Свойства флекс элементов">
					<Grid cols={2}>
						<SelectRow
							label="align-self"
							value={s.alignSelf ?? ''}
							onChange={(v) => patchStyle({ alignSelf: (v || undefined) as any })}
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
			}

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
				{s.display === 'flex' &&
					<Grid cols={1}>
						<NumOrTokenRow
							label="gap (промежутки)"
							value={s.gap}
							onNumChange={(v) => patchStyle({ gap: v })}
							tokenValue={tokenOrEmpty(s.gap)}
							onTokenChange={(tok) =>
								patchStyle({ gap: tok ? (`token:${tok}` as any) : undefined })
							}
							tokenOptions={spacingOptions}
						/>
					</Grid>}

				<Grid cols={1}>
					<NumOrTokenRow
						label="padding"
						value={s.p}
						onNumChange={(v) => patchStyle({ p: v })}
						tokenValue={tokenOrEmpty(s.p)}
						onTokenChange={(t) =>
							patchStyle({ p: t ? (`token:${t}` as any) : undefined })
						}
						tokenOptions={spacingOptions}
					/>
					<NumOrTokenRow
						label="padding-x"
						value={s.px as any}
						onNumChange={(v) => patchStyle({ px: v as any })}
						tokenValue={tokenOrEmpty(s.px)}
						onTokenChange={(t) =>
							patchStyle({ px: t ? (`token:${t}` as any) : undefined })
						}
						tokenOptions={spacingOptions}
					/>
					<NumOrTokenRow
						label="padding-y"
						value={s.py}
						onNumChange={(v) => patchStyle({ py: v })}
						tokenValue={tokenOrEmpty(s.py)}
						onTokenChange={(t) =>
							patchStyle({ py: t ? (`token:${t}` as any) : undefined })
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
							patchStyle({ m: t ? (`token:${t}` as any) : undefined })
						}
						tokenOptions={spacingOptions}
					/>
				</Grid>
				<Grid cols={2}>
					<NumRow
						label="margin-x"
						value={s.mx}
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
						value={s.ml as number}
						onChange={(v) => patchStyle({ ml: v as any })}
					/>
				</Grid>
			</Section>

			<Section title="Цвета / фон / границы">
				<Grid cols={3}>
					<ColorTokenRow
						label="bg"
						value={toStr(s.bg)}
						onText={(v) => patchStyle({ bg: emptyToUndef(v) })}
						tokenValue={tokenOrEmpty(s.bg)}
						onTokenChange={(tok) =>
							patchStyle({ bg: tok ? (`token:${tok}` as any) : undefined })
						}
						options={colorOptions}
					/>
					<ColorTokenRow
						label="color"
						value={toStr(s.color)}
						onText={(v) => patchStyle({ color: emptyToUndef(v) })}
						tokenValue={tokenOrEmpty(s.color)}
						onTokenChange={(tok) =>
							patchStyle({
								color: tok ? (`token:${tok}` as any) : undefined,
							})
						}
						options={colorOptions}
					/>
					<ColorTokenRow
						label="borderColor"
						value={toStr(s.borderColor)}
						onText={(v) => patchStyle({ borderColor: emptyToUndef(v) })}
						tokenValue={tokenOrEmpty(s.borderColor)}
						onTokenChange={(tok) =>
							patchStyle({
								borderColor: tok ? (`token:${tok}` as any) : undefined,
							})
						}
						options={colorOptions}
					/>
				</Grid>
			</Section>

			<Section title="Декор">
				<Grid cols={3}>
					<TokenOnlyRow
						label="radius"
						currentValue={tokenOrEmpty(s.radius)}
						onTokenChange={(tok) =>
							patchStyle({
								radius: tok ? (`token:${tok}` as any) : undefined,
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
						label="shadow"
						currentValue={tokenOrEmpty(s.shadow)}
						onTokenChange={(tok) =>
							patchStyle({
								shadow: tok ? (`token:${tok}` as any) : undefined,
							})
						}
						options={shadowOptions}
					/>
					<SelectRow
						label="textAlign"
						value={s.textAlign ?? ''}
						onChange={(v) =>
							patchStyle({ textAlign: (v || undefined) as any })
						}
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

const card : React.CSSProperties = {
	border: '1px solid #e6e8ef',
	borderRadius: 12,
	padding: 12,
	background: '#fff',
};

const input : React.CSSProperties = {
	width: '100%',
	border: '1px solid #d0d3dc',
	borderRadius: 8,
	padding: '6px 8px',
	marginBottom: 10,
	fontSize: 13,
};

const chip : React.CSSProperties = {
	padding: '4px 8px',
	border: '1px solid #d0d3dc',
	borderRadius: 999,
	background: '#fff',
	fontSize: 12,
	cursor: 'pointer',
};

function Label({ children } : { children : React.ReactNode }) {
	return <div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>{children}</div>;
}

function Section({ title, children } : { title? : string; children : React.ReactNode }) {
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
			  } : {
	cols? : number;
	children : React.ReactNode;
	style? : React.CSSProperties;
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
				   } : {
	label : string;
	value : string | number;
	onChange : (v : string) => void;
	options : [string, string][];
	disabled? : boolean;
}) {
	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
			<span style={{ color: '#687087' }}>{label}</span>
			<select
				style={{ ...input, marginBottom: 0 }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
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
				 } : {
	label : string;
	value : string;
	onChange : (v : string) => void;
	placeholder? : string;
}) {
	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
			<span style={{ color: '#687087' }}>{label}</span>
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
							 }: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	error?: string;
	validate?: (value: string) => string | undefined;
	helperText?: string;
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
				<span style={{ color: '#687087' }}>{label}</span>
			</div>
			<input
				style={{
					...input,
					marginBottom: 0,
					border: displayError ? '#ff4d4f' : input.border,
					padding: '8px 12px',
				}}
				value={value}
				onChange={handleChange}
				onBlur={handleBlur}
				placeholder={placeholder}
			/>
			{displayError ? (
				<div style={{
					color: '#ff4d4f',
					fontSize: 11,
					marginTop: 2,
					lineHeight: 1.2,
				}}>
					{displayError}
				</div>
			) : helperText && (
				<div style={{
					color: '#687087',
					fontSize: 11,
					marginTop: 2,
					lineHeight: 1.2,
					fontStyle: 'italic'
				}}>
					{helperText}
				</div>
			)}
		</label>
	);
}

function NumberRow({
					   label,
					   value,
					   onChange,
					   disabled,
				   } : {
	label : string;
	value : string;
	onChange : (v : string) => void;
	disabled? : boolean;
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
			/>
		</label>
	);
}

function NumRow({
					label,
					value,
					onChange,
				} : {
	label : string;
	value : number | undefined;
	onChange : (v : number | undefined) => void;
}) {
	return (
		<NumberRow
			label={label}
			value={toNumStr(value)}
			onChange={(v) => onChange(strToNumOrUndef(v))}
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
					   } : {
	label : string;
	value : number | string | undefined;
	onNumChange : (v : number | undefined) => void;
	tokenValue : string;
	onTokenChange : (tok : string) => void;
	tokenOptions : [string, string][];
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
					   } : {
	label : string;
	value : string;
	onText : (v : string) => void;
	tokenValue : string;
	onTokenChange : (tok : string) => void;
	options : [string, string][];
}) {
	const isTok = tokenValue !== '';
	return (
		<div>
			<Label>{label}</Label>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
				<input
					style={{ ...input, marginBottom: 0 }}
					value={isTok ? '' : value}
					onChange={(e) => onText(e.target.value)}
					placeholder="#RRGGBB / rgba(...) / css-color"
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
					  } : {
	label : string;
	currentValue : string;
	onTokenChange : (tok : string) => void;
	options : [string, string][];
	allowManualNumber? : boolean;
	manualValue? : string;
	onManualChange? : (v : string) => void;
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
					 } : {
	value : string;
	onChange : (tok : string) => void;
	options : [string, string][];
	placeholder? : string;
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

function toNumStr(v : number | string | undefined) : string {
	if (typeof v === 'number') return String(v);
	if (typeof v === 'string') {
		const n = Number(v);
		return Number.isFinite(n) ? String(n) : '';
	}
	return '';
}

function toStr(v : number | string | undefined) : string {
	return v == null ? '' : String(v);
}

function strToNumOrUndef(s : string) : number | undefined {
	const n = Number(s);
	return Number.isFinite(n) ? n : undefined;
}

/**
 * Processes a size value from an input field
 * - Empty string → undefined
 * - Numeric string → number
 * - Other strings (like '100%') → string
 */
function processSizeValue(value : string) : number | string | undefined {
	const trimmed = value.trim();
	if (trimmed === '') return undefined;

	const num = Number(trimmed);
	if (!isNaN(num) && trimmed === num.toString()) {
		return num;
	}

	return trimmed;
}

function emptyToUndef(s : string) : string | undefined {
	return s.trim() === '' ? undefined : s;
}

const processOrder = (v : number | undefined) : number | undefined => {
	if (v === undefined) return undefined;
	return Number.isFinite(v) ? v : 0;
};

function tokenOrEmpty(v : any) : string {
	return typeof v === 'string' && v.startsWith('token:')
		? v.replace(/^token:/, '')
		: '';
}

function isNumberLike(v : any) {
	return typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v)));
}
