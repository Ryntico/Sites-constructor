import React from 'react';
import type { NodeJson, ThemeTokens } from '@/types/siteTypes.ts';
import { isPercentSize } from '@/components/constructor/render/helpers.ts';

type StyleWithWH = React.CSSProperties & {
	w?: string | number;
	h?: string | number;
};

export function renderPrimitive(
	node: NodeJson,
	baseStyle: React.CSSProperties,
	theme: ThemeTokens,
) {
	switch (node.type) {
		case 'form':
			return (
				<form
					action={node.props?.formAction}
					method={node.props?.formMethod}
					encType={node.props?.enctype}
				/>
			);

		case 'page':
		case 'section':
		case 'box':
		case 'row':
			return <div data-prim="true" />;

		case 'heading': {
			const level = Math.min(6, Math.max(1, Number(node.props?.level ?? 2))) as
				| 1
				| 2
				| 3
				| 4
				| 5
				| 6;
			const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
			return React.createElement(
				Tag,
				{ style: baseStyle, 'data-prim': 'true' },
				node.props?.text ?? 'Heading',
			);
		}

		case 'paragraph':
			return (
				<p data-prim="true" style={baseStyle}>
					{node.props?.text ?? 'Text'}
				</p>
			);

		case 'richtext': {
			const html = node.props?.text ?? '';
			const hasHtml = /<[a-z][\s\S]*>/i.test(html);
			return hasHtml ? (
				<>
					<style>{`blockquote {
            background: ${theme.components?.blockquote?.bg || 'rgba(99,102,241,.1)'};
            border-left: ${theme.components?.blockquote?.borderLeft || '4px solid rgb(59,130,246)'};
            border-radius: ${theme.components?.blockquote?.radius || '8'}px;
            padding: ${theme.components?.blockquote?.p || '16px 20px'};
            color: ${theme.components?.blockquote?.color};
            font-style: italic;
          }`}</style>
					<div
						data-prim="true"
						style={baseStyle}
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				</>
			) : (
				<p data-prim="true" style={baseStyle}>
					{html || 'Text'}
				</p>
			);
		}

		case 'image': {
			const style: StyleWithWH = {
				display: 'block',
				maxWidth: '100%',
				height: 'auto',
				...(baseStyle as StyleWithWH),
			};

			if (isPercentSize(style.width) || isPercentSize(style.w)) {
				delete style.width;
				delete style.w;
			}
			if (isPercentSize(style.height) || isPercentSize(style.h)) {
				delete style.height;
				delete style.h;
			}

			return (
				<img
					data-prim="true"
					src={node.props?.src}
					alt={node.props?.alt ?? ''}
					style={style}
				/>
			);
		}

		case 'button': {
			const label = node.props?.text ?? 'Button';
			if (node.props?.href) {
				return (
					<a
						data-prim="true"
						href={node.props.href}
						style={{
							...baseStyle,
							display: 'inline-block',
							textDecoration: 'none',
						}}
					>
						{label}
					</a>
				);
			}
			return (
				<button
					data-prim="true"
					type="button"
					style={{ ...baseStyle, display: 'inline-block' }}
				>
					{label}
				</button>
			);
		}

		case 'divider':
			return <div>---------------------Разделитель---------------------</div>;

		case 'list':
			return <ul data-prim="true" style={baseStyle} />;

		case 'listItem':
			return (
				<li data-prim="true" style={baseStyle}>
					{node.props?.text ?? ''}
				</li>
			);

		case 'blockquote': {
			const footerStyle: React.CSSProperties = {
				fontSize: 12,
				color: '#888',
				marginTop: 8,
			};
			return (
				<blockquote data-prim="true" style={baseStyle}>
					{node.props?.text ?? 'Цитата'}
					{(node.props?.preAuthor || node.props?.cite) && (
						<p style={footerStyle}>
							{node.props?.preAuthor}
							{node.props?.cite && (
								<cite style={{ marginLeft: 8, fontStyle: 'italic' }}>
									{node.props.cite}
								</cite>
							)}
						</p>
					)}
				</blockquote>
			);
		}

		case 'input': {
			const id = `input-${node.id}`;
			const input = (
				<input
					id={id}
					type={node.props?.type || 'text'}
					name={node.props?.name}
					value={node.props?.value}
					placeholder={node.props?.placeholder}
					min={node.props?.min}
					max={node.props?.max}
					step={node.props?.step}
					minLength={node.props?.minlength}
					maxLength={node.props?.maxlength}
					pattern={node.props?.pattern}
					title={node.props?.title}
					size={node.props?.size}
					required={node.props?.required}
					disabled={node.props?.disabled}
					readOnly={node.props?.readonly}
					autoComplete={node.props?.autocomplete ? 'on' : 'off'}
					autoFocus={node.props?.autofocus}
					style={baseStyle}
				/>
			);
			return node.props?.label ? (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						gap: '4px',
					}}
				>
					<label htmlFor={id} style={{ fontSize: 14, color: '#4a5568' }}>
						{node.props.label}
					</label>
					{input}
				</div>
			) : (
				input
			);
		}

		case 'textarea': {
			const id = `textarea-${node.id}`;
			const textarea = (
				<textarea
					id={id}
					name={node.props?.name}
					rows={node.props?.rows}
					cols={node.props?.cols}
					placeholder={node.props?.placeholder}
					disabled={node.props?.disabled}
					readOnly={node.props?.readonly}
					required={node.props?.required}
					maxLength={node.props?.maxlength}
					minLength={node.props?.minlength}
					autoFocus={node.props?.autofocus}
					form={node.props?.formId}
					wrap={node.props?.wrap}
					autoComplete={node.props?.autocomplete ? 'on' : 'off'}
					spellCheck={node.props?.spellcheck}
					title={node.props?.title}
					style={baseStyle}
				>
					{node.props?.value}
				</textarea>
			);
			return node.props?.label ? (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						gap: '4px',
					}}
				>
					<label htmlFor={id} style={{ fontSize: 14, color: '#4a5568' }}>
						{node.props.label}
					</label>
					{textarea}
				</div>
			) : (
				textarea
			);
		}

		case 'select': {
			const id = `select-${node.id}`;
			const select = (
				<select
					id={id}
					name={node.props?.name}
					disabled={node.props?.disabled}
					required={node.props?.required}
					autoFocus={node.props?.autofocus}
					multiple={node.props?.multiple}
					size={node.props?.size}
					form={node.props?.formId}
					style={baseStyle}
				>
					{(node.props?.options ?? []).map((o, i) => (
						<option key={i} value={o.value}>
							{o.text}
						</option>
					))}
				</select>
			);
			return node.props?.label ? (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
						gap: '4px',
					}}
				>
					<label htmlFor={id} style={{ fontSize: 14, color: '#4a5568' }}>
						{node.props.label}
					</label>
					{select}
				</div>
			) : (
				select
			);
		}

		case 'anchor':
			return (
				<div
					id={node.id}
					style={{ ...baseStyle, width: 100 }}
					title="Не отображается на сайте и превью"
				>
					Якорь ⚓
				</div>
			);

		default:
			return null;
	}
}
