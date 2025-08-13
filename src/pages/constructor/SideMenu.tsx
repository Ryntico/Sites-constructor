import {
	Paper,
	Stack,
	Text,
	TextInput,
	ColorInput,
	SimpleGrid,
	ScrollArea,
} from '@mantine/core';
import { MenuItem } from '@components/menuItem/MenuItem';
import Icon from '@assets/constructor-menu/icons.svg?react';
import IndentIncrease from '@assets/constructor-menu/indent-increase.svg?react';
import LetterT from '@assets/constructor-menu/letter-t.svg?react';
import ListCheck from '@assets/constructor-menu/list-check.svg?react';
import ListNumbers from '@assets/constructor-menu/list-numbers.svg?react';
import Quote from '@assets/constructor-menu/quote.svg?react';
import PhotoScan from '@assets/constructor-menu/photo-scan.svg?react';
import SpacingVertical from '@assets/constructor-menu/spacing-vertical.svg?react';
import SquareRoundedMinus from '@assets/constructor-menu/square-rounded-minus.svg?react';

// TODO Нужно ли это объединять ? это проблема будущих нас
const basicItems = [
	{ label: 'Заголовок', icon: <LetterT /> },
	{ label: 'Параграф', icon: <IndentIncrease /> },
	{ label: 'Маркированный', icon: <ListCheck /> },
	{ label: 'Нумерованный', icon: <ListNumbers /> },
	{ label: 'Изображение', icon: <PhotoScan /> },
	{ label: 'Разделитель', icon: <SpacingVertical /> },
	{ label: 'Кнопка', icon: <SquareRoundedMinus /> },
	{ label: 'Цитата', icon: <Quote /> },
];

const formItems = [
	{ label: 'input', icon: <Icon /> },
	{ label: 'textarea', icon: <Icon /> },
];

export const SideMenu = () => {
	return (
		<Paper withBorder radius="0" w="280" p="16" h="100%">
			<ScrollArea h="100%" type="auto">
				<Stack gap="sm">
					<div>
						<Text size="sm">Название сайта</Text>
						<TextInput placeholder="название сайта" />
					</div>

					<div>
						<Text size="sm">Цвет страницы</Text>
						<ColorInput format="hex" placeholder="цвет страницы" />
					</div>

					<Stack gap="xs" mt="sm">
						<Text>Базовый</Text>
						<SimpleGrid cols="2" spacing="12">
							{basicItems.map(({ label, icon }) => (
								<MenuItem key={label} label={label} icon={icon} h="84" />
							))}
						</SimpleGrid>
					</Stack>

					<Stack gap="xs" mt="md">
						<Text>Форма</Text>
						<SimpleGrid cols="2" spacing="12">
							{formItems.map(({ label, icon }) => (
								<MenuItem key={label} label={label} icon={icon} h="84" />
							))}
						</SimpleGrid>
					</Stack>
				</Stack>
			</ScrollArea>
		</Paper>
	);
};
