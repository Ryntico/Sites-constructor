import { Paper, Text, Center, ThemeIcon } from '@mantine/core';
import { type JSX } from 'react';

interface MenuItemProps {
	label: string;
	icon?: JSX;
	h?: string | number;
}

export const MenuItem = ({ label, icon, h }: MenuItemProps) => {
	return (
		<Paper
			withBorder
			radius="md"
			p="md"
			h={h}
			style={{
				cursor: 'pointer',
				userSelect: 'none',
			}}
		>
			{icon && (
				<Center>
					<ThemeIcon size="28">{icon}</ThemeIcon>
				</Center>
			)}

			<Center mt={icon ? 8 : undefined} h={icon ? undefined : '100%'}>
				<Text size="sm" ta="center">
					{label}
				</Text>
			</Center>
		</Paper>
	);
};
