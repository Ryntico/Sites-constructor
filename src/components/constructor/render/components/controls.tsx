import React from 'react';
import type { Action } from '@/types/siteTypes.ts';
import { serializeActionsAttr } from '../helpers.ts';

type DataAttrs = { 'data-res-id': string };

type BaseProps = {
	base: React.CSSProperties;
	dataAttrs: DataAttrs;
};

const Labeled: React.FC<{ id: string; label?: string; children: React.ReactNode }> = ({
	id,
	label,
	children,
}) =>
	label ? (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-start',
				gap: 4,
			}}
		>
			<label htmlFor={id} style={{ fontSize: 14, color: '#4a5568' }}>
				{label}
			</label>
			{children}
		</div>
	) : (
		<>{children}</>
	);

export function Button({
	base,
	dataAttrs,
	href,
	text = 'Button',
	actions,
}: BaseProps & { href?: string; text?: string; actions?: Record<'click', Action[]> }) {
	const act = serializeActionsAttr(actions);
	if (href) {
		return (
			<a
				href={href}
				style={{ ...base, textDecoration: 'none', display: 'inline-block' }}
				data-actions={act}
				{...dataAttrs}
			>
				{text}
			</a>
		);
	}
	return (
		<button style={base} data-actions={act} {...dataAttrs}>
			{text}
		</button>
	);
}

type Dir = React.HTMLAttributes<HTMLElement>['dir'];
type InputMode = React.HTMLAttributes<HTMLElement>['inputMode'];
type Wrap = 'soft' | 'hard';

export function Input({
	base,
	dataAttrs,
	id,
	label,
	...p
}: BaseProps & {
	id: string;
	label?: string;
	type?: string;
	name?: string;
	value?: string;
	placeholder?: string;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	minlength?: number;
	maxlength?: number;
	pattern?: string;
	title?: string;
	size?: number;
	required?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	autocomplete?: boolean;
	autofocus?: boolean;
	inputmode?: InputMode;
	spellcheck?: boolean;
	dir?: Dir;
}) {
	const el = (
		<input
			id={id}
			type={p.type || 'text'}
			name={p.name}
			value={p.value}
			placeholder={p.placeholder}
			min={p.min}
			max={p.max}
			step={p.step}
			minLength={p.minlength}
			maxLength={p.maxlength}
			pattern={p.pattern}
			title={p.title}
			size={p.size}
			required={p.required}
			disabled={p.disabled}
			readOnly={p.readonly}
			autoComplete={p.autocomplete ? 'on' : 'off'}
			autoFocus={p.autofocus}
			inputMode={p.inputmode}
			spellCheck={p.spellcheck}
			dir={p.dir}
			style={base}
			{...dataAttrs}
		/>
	);
	return (
		<Labeled id={id} label={label}>
			{el}
		</Labeled>
	);
}

export function Textarea({
	base,
	dataAttrs,
	id,
	label,
	...p
}: BaseProps & {
	id: string;
	label?: string;
	name?: string;
	rows?: number;
	cols?: number;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	required?: boolean;
	maxlength?: number;
	minlength?: number;
	autofocus?: boolean;
	formId?: string;
	wrap?: Wrap;
	autocomplete?: boolean;
	spellcheck?: boolean;
	title?: string;
	dir?: Dir;
	value?: string;
}) {
	const el = (
		<textarea
			id={id}
			name={p.name}
			rows={p.rows}
			cols={p.cols}
			placeholder={p.placeholder}
			disabled={p.disabled}
			readOnly={p.readonly}
			required={p.required}
			maxLength={p.maxlength}
			minLength={p.minlength}
			autoFocus={p.autofocus}
			form={p.formId}
			wrap={p.wrap}
			autoComplete={p.autocomplete ? 'on' : 'off'}
			spellCheck={p.spellcheck}
			title={p.title}
			dir={p.dir}
			style={base}
			{...dataAttrs}
		>
			{p.value}
		</textarea>
	);
	return (
		<Labeled id={id} label={label}>
			{el}
		</Labeled>
	);
}

export function Select({
	base,
	dataAttrs,
	id,
	label,
	name,
	disabled,
	required,
	autofocus,
	multiple,
	size,
	formId,
	options,
}: BaseProps & {
	id: string;
	label?: string;
	name?: string;
	disabled?: boolean;
	required?: boolean;
	autofocus?: boolean;
	multiple?: boolean;
	size?: number;
	formId?: string;
	options?: Array<{ value: string; text: string }>;
}) {
	const el = (
		<select
			id={id}
			name={name}
			disabled={disabled}
			required={required}
			autoFocus={autofocus}
			multiple={multiple}
			size={size}
			form={formId}
			style={base}
			{...dataAttrs}
		>
			{options?.map((o) => (
				<option key={o.value} value={o.value}>
					{o.text}
				</option>
			))}
		</select>
	);
	return (
		<Labeled id={id} label={label}>
			{el}
		</Labeled>
	);
}

export function Form({
	base,
	dataAttrs,
	children,
	formId,
	formAction,
	formMethod,
	enctype,
}: BaseProps & {
	children: React.ReactNode;
	formId?: string;
	formAction?: string;
	formMethod?: string;
	enctype?: React.FormHTMLAttributes<HTMLFormElement>['encType'];
}) {
	return (
		<form
			{...(formId ? { id: formId } : {})}
			action={formAction}
			method={formMethod}
			encType={enctype}
			style={base}
			{...dataAttrs}
		>
			{children}
		</form>
	);
}
