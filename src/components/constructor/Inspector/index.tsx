import { useMemo } from 'react';
import { Paper, Text, Box } from '@mantine/core';
import type { PageSchema, ThemeTokens, NodeJson, StyleShortcuts } from '@/types/siteTypes.ts';
import { isContainer } from '@/components/constructor/ops/schemaOps.ts';
import { RichText } from '@/components/RichText.tsx';
import {
	FormInspector,
	TextareaInspector,
	SelectInspector,
	InputInspector,
	HeadingInspector,
	ButtonInspector,
	ImageInspector,
	BlockquoteInspector
} from './NodeInspectors';
import {
	LayoutInspector,
	FlexItemInspector,
	SizingInspector,
	SpacingInspector,
	ColorInspector,
	DecorInspector
} from './StyleInspectors';
import {
	NumberInputInspector,
	RangeInputInspector,
	TextInputInspector
} from './InputSpecificInspectors';

type Props = {
	schema: PageSchema;
	selectedId: string | null;
	onChange(next: PageSchema): void;
	theme?: ThemeTokens;
	ownerId?: string;
};

export function Inspector({ schema, selectedId, onChange, theme, ownerId }: Props) {
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

	const patchStyle = (patch: Partial<StyleShortcuts>) => {
		if (!node) return;
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

	if (!selectedId) return (
		<Paper p="md" withBorder>
			Выберите элемент
		</Paper>
	);

	if (!node) return (
		<Paper p="md" withBorder>
			Нет узла
		</Paper>
	);

	const s = (p.style?.[bp] ?? {}) as StyleShortcuts;

	return (
		<Paper p="md" withBorder style={{ display: 'grid', gap: 12 }}>
			<Box>
				<Text fw={600} mb={4}>Инспектор</Text>
				<Text size="sm" c="dimmed">{node.type}</Text>
			</Box>

			{node.type === 'richtext' && (
				<RichText value={p.text ?? ''} patchProps={patchProps} />
			)}

			{(node.type === 'heading' || node.type === 'paragraph' || node.type === 'button') && (
				<HeadingInspector node={node} patchProps={patchProps} />
			)}

			{node.type === 'blockquote' && (
				<BlockquoteInspector node={node} patchProps={patchProps} />
			)}

			{node.type === 'button' && (
				<ButtonInspector node={node} patchProps={patchProps} />
			)}

			{node.type === 'image' && (
				<ImageInspector node={node} patchProps={patchProps} ownerId={ownerId} />
			)}

			{node.type === 'form' && (
				<FormInspector node={node} patchProps={patchProps} />
			)}

			{node.type === 'textarea' && (
				<TextareaInspector node={node} patchProps={patchProps} parentNode={parentNode} />
			)}

			{node.type === 'select' && (
				<SelectInspector node={node} patchProps={patchProps} parentNode={parentNode} />
			)}

			{node.type === 'input' && (
				<>
					<InputInspector node={node} patchProps={patchProps} parentNode={parentNode} />

					{p.type === 'number' && (
						<NumberInputInspector node={node} patchProps={patchProps} />
					)}

					{p.type === 'range' && (
						<RangeInputInspector node={node} patchProps={patchProps} />
					)}

					{['text', 'password', 'search', 'email', 'tel', 'url'].includes(
						p.type as string,
					) && (
						<TextInputInspector node={node} patchProps={patchProps} />
					)}
				</>
			)}

			{isContainer(node) && (
				<LayoutInspector node={node} patchStyle={patchStyle} s={s} />
			)}

			{parentNode?.props?.style?.[bp]?.display === 'flex' && (
				<FlexItemInspector patchStyle={patchStyle} s={s} />
			)}

			<SizingInspector patchStyle={patchStyle} s={s} />

			<SpacingInspector
				patchStyle={patchStyle}
				s={s}
				spacingOptions={spacingOptions}
				node={node}
			/>

			<ColorInspector
				patchStyle={patchStyle}
				s={s}
				colorOptions={colorOptions}
			/>

			<DecorInspector
				patchStyle={patchStyle}
				s={s}
				radiusOptions={radiusOptions}
				shadowOptions={shadowOptions}
			/>
		</Paper>
	);
}