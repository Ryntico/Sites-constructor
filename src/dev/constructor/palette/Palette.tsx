import { useState, useRef, type JSX } from 'react';
import {
	Paper,
	Box,
	Text,
	Button,
	ScrollArea,
	Group,
	Grid,
} from '@mantine/core';
import { PaletteItem } from './PaletteItem';
import {
	ChevronLeft,
	DoubleChevronRight,
	BoxCard,
	RichText,
	Image,
	Button as ButtonIcon,
	Form,
	Blockquote,
	Select,
	Input,
	Textarea,
	Divider,
	Header,
	Paragraph,
	Anchor,
} from './PaletteIcons';

const icons = {
	'box_card': BoxCard,
	'richtext': RichText,
	'image_card': Image,
	'button_primary': ButtonIcon,
	'form': Form,
	'input': Input,
	'select': Select,
	'textarea': Textarea,
	'blockquote': Blockquote,
	'divider': Divider,
	'heading_h1': Header,
	'paragraph': Paragraph,
	'anchor': Anchor,
};

export function Palette({ items }: { items: { id: string; name: string }[] }) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	const itemsForMutateSort = [...items];

	const manualSortedIds = [
		'box_card',
		'heading_h1',
		'richtext',
		'image_card',
		'button_primary',
		'form',
		'input',
		'select',
		'textarea',
		'blockquote',
		'anchor',
		'divider',
	];

	manualSortedIds.reverse().forEach((sortedId) => {
		const i = itemsForMutateSort.findIndex((item) => item.id === sortedId);
		if (i !== -1) {
			const [item] = itemsForMutateSort.splice(i, 1);
			itemsForMutateSort.unshift(item);
		}
	});

	const itemsForRender: { id: string; name: string; icon: JSX.Element }[] = itemsForMutateSort.map((item) => ({
		...item,
		icon: icons[item.id as keyof typeof icons] || icons['box_card'],
	}));

	const toggleCollapse = () => {
		setIsCollapsed(!isCollapsed);
	};

	return (
		<Paper
			ref={contentRef}
			withBorder
			p={isCollapsed ? '8px 0 0 0' : 'sm'}
			style={{
				height: 'calc(100vh - 160px)',
				overflow: 'hidden',
				width: isCollapsed ? 20 : 240,
				transition: 'width 0.3s ease',
				position: 'relative',
			}}
		>
			<ScrollArea h="100%"
						onClick={isCollapsed ? toggleCollapse : undefined}
						style={isCollapsed ? { cursor: 'pointer' } : {}}>
				{isCollapsed ? (
					<Box onClick={toggleCollapse}
						 h="100%"
						 style={{
							 display: 'flex',
							 alignItems: 'center',
							 justifyContent: 'center',
							 cursor: 'pointer',
						 }}
					>
						<DoubleChevronRight />
					</Box>
				) : (
					<Box>
						<Group justify="space-evenly" align="center" mb="xs">
							<Text fw={600} size="sm">Элементы</Text>
							<Button
								variant="subtle"
								color="gray"
								size="xs"
								p={4}
								onClick={toggleCollapse}
							>
								<ChevronLeft />
							</Button>
						</Group>

						<Text size="xs" c="dimmed" mb="md">
							Перетащите в редактор
						</Text>

						<Grid gutter="xs">
							{itemsForRender.map((i) => (
								<Grid.Col key={i.id} span={6}>
									<PaletteItem name={i.name} mimeKey={i.id} icon={i.icon} />
								</Grid.Col>
							))}
						</Grid>
					</Box>
				)}
			</ScrollArea>
		</Paper>
	);
}