import { memo } from 'react';
import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconBrightnessUp, IconMoon } from '@/components/ui/icons';

export const ThemeSwitcher = memo(() => {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();

	return (
		<Tooltip label="переключить тему" position="bottom">
			<ActionIcon variant="subtle" size="lg" onClick={toggleColorScheme}>
				{colorScheme === 'dark' ? IconBrightnessUp({stroke: '#607d8b'}) : IconMoon({stroke: '#607d8b'})}
			</ActionIcon>
		</Tooltip>
	);
});
