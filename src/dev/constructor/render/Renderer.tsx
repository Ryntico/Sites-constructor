import React from 'react';
import type { PageSchema, NodeJson, ThemeTokens, Action } from '@/types/siteTypes.ts';
import { mergeResponsive } from './responsive.ts';
import { dataResAttr } from './helpers.ts';
import { asInputMode, asWrap } from './helpers';
import { Containers, Text, Controls, Misc } from './components';

export function RenderTree({
	schema,
	theme,
}: {
	schema: PageSchema;
	theme: ThemeTokens;
}) {
	const root = schema.nodes[schema.rootId];
	return <Node node={root} schema={schema} theme={theme} />;
}

function Node({
	node,
	schema,
	theme,
}: {
	node: NodeJson;
	schema: PageSchema;
	theme: ThemeTokens;
}) {
	const kids = node.childrenOrder?.map((id) => schema.nodes[id]) ?? [];
	const children = kids.map((k) => (
		<Node key={k.id} node={k} schema={schema} theme={theme} />
	));
	const { base, mediaCssText } = mergeResponsive(theme, node.props);
	const dataAttrs = dataResAttr(node.id);

	switch (node.type) {
		case 'page':
			return (
				<Containers.Page
					base={{ ...base, minHeight: '100vh', background: theme.colors.page }}
					theme={theme}
					mediaCssText={mediaCssText}
					dataAttrs={dataAttrs}
				>
					{children}
				</Containers.Page>
			);

		case 'section':
			return (
				<Containers.Container as="section" base={base} dataAttrs={dataAttrs}>
					{children}
				</Containers.Container>
			);

		case 'box':
		case 'row':
			return (
				<Containers.Container as="div" base={base} dataAttrs={dataAttrs}>
					{children}
				</Containers.Container>
			);

		case 'heading':
			return (
				<Text.Heading
					base={base}
					dataAttrs={dataAttrs}
					level={node.props?.level}
					text={node.props?.text}
				/>
			);

		case 'paragraph':
			return (
				<Text.Paragraph
					base={base}
					dataAttrs={dataAttrs}
					text={node.props?.text}
				/>
			);

		case 'richtext':
			return (
				<Text.RichText
					base={base}
					dataAttrs={dataAttrs}
					html={node.props?.text}
				/>
			);

		case 'image':
			return (
				<Misc.Image
					base={base}
					dataAttrs={dataAttrs}
					src={node.props?.src}
					alt={node.props?.alt}
				/>
			);

		case 'button':
			return (
				<Controls.Button
					base={base}
					dataAttrs={dataAttrs}
					href={node.props?.href}
					text={node.props?.text}
					actions={node.props?.on as Record<'click', Action[]> | undefined}
				/>
			);

		case 'input':
			return (
				<Controls.Input
					base={base}
					dataAttrs={dataAttrs}
					id={`input-${node.id}`}
					label={node.props?.label}
					type={node.props?.type}
					name={node.props?.name}
					value={node.props?.value}
					placeholder={node.props?.placeholder}
					min={node.props?.min}
					max={node.props?.max}
					step={node.props?.step}
					minlength={node.props?.minlength}
					maxlength={node.props?.maxlength}
					pattern={node.props?.pattern}
					title={node.props?.title}
					size={node.props?.size}
					required={!!node.props?.required}
					disabled={!!node.props?.disabled}
					readonly={!!node.props?.readonly}
					autocomplete={!!node.props?.autocomplete}
					autofocus={!!node.props?.autofocus}
					inputmode={asInputMode(node.props?.inputmode)}
					spellcheck={
						typeof node.props?.spellcheck === 'boolean'
							? node.props?.spellcheck
							: undefined
					}
					dir={node.props?.dir}
				/>
			);

		case 'textarea':
			return (
				<Controls.Textarea
					base={base}
					dataAttrs={dataAttrs}
					id={`textarea-${node.id}`}
					label={node.props?.label}
					name={node.props?.name}
					rows={node.props?.rows}
					cols={node.props?.cols}
					placeholder={node.props?.placeholder}
					disabled={!!node.props?.disabled}
					readonly={!!node.props?.readonly}
					required={!!node.props?.required}
					maxlength={node.props?.maxlength}
					minlength={node.props?.minlength}
					autofocus={!!node.props?.autofocus}
					formId={node.props?.formId}
					wrap={asWrap(node.props?.wrap)}
					autocomplete={!!node.props?.autocomplete}
					spellcheck={
						typeof node.props?.spellcheck === 'boolean'
							? node.props?.spellcheck
							: undefined
					}
					title={node.props?.title}
					dir={node.props?.dir}
					value={node.props?.value}
				/>
			);

		case 'select':
			return (
				<Controls.Select
					base={base}
					dataAttrs={dataAttrs}
					id={`select-${node.id}`}
					label={node.props?.label}
					name={node.props?.name}
					disabled={!!node.props?.disabled}
					required={!!node.props?.required}
					autofocus={!!node.props?.autofocus}
					multiple={!!node.props?.multiple}
					size={node.props?.size}
					formId={node.props?.formId}
					options={node.props?.options}
				/>
			);

		case 'divider':
			return <Misc.Divider base={base} dataAttrs={dataAttrs} />;

		case 'list':
			return (
				<Misc.List
					as={node.props?.variant === 'ol' ? 'ol' : 'ul'}
					base={base}
					dataAttrs={dataAttrs}
				>
					{children}
				</Misc.List>
			);

		case 'listItem':
			return (
				<Misc.ListItem
					base={base}
					dataAttrs={dataAttrs}
					text={node.props?.text}
				/>
			);

		case 'form':
			return (
				<Controls.Form
					base={base}
					dataAttrs={dataAttrs}
					formId={node.props?.formId}
					formAction={node.props?.formAction}
					formMethod={node.props?.formMethod}
					enctype={
						node.props?.enctype as
							| React.FormHTMLAttributes<HTMLFormElement>['encType']
							| undefined
					}
				>
					{children}
				</Controls.Form>
			);

		case 'blockquote':
			return (
				<Text.Blockquote
					base={base}
					dataAttrs={dataAttrs}
					text={node.props?.text}
					preAuthor={node.props?.preAuthor}
					cite={node.props?.cite}
				/>
			);

		case 'anchor':
			return <Misc.Anchor id={node.id} base={base} dataAttrs={dataAttrs} />;

		default:
			return (
				<div style={{ color: 'crimson' }} {...dataAttrs}>
					Unknown node: {node.type}
				</div>
			);
	}
}
