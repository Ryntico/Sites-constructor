import { memo } from 'react';
import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';

const BrightnessUpIcon = <svg
	xmlns="http://www.w3.org/2000/svg"
	width="48"
	height="48"
	viewBox="0 0 24 24"
	fill="none"
	stroke="#607d8b"
	strokeWidth="1"
	strokeLinecap="round"
	strokeLinejoin="round"
>
	<path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
	<path d="M12 5l0 -2" />
	<path d="M17 7l1.4 -1.4" />
	<path d="M19 12l2 0" />
	<path d="M17 17l1.4 1.4" />
	<path d="M12 19l0 2" />
	<path d="M7 17l-1.4 1.4" />
	<path d="M6 12l-2 0" />
	<path d="M7 7l-1.4 -1.4" />
</svg>

const MoonIcon =
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="48"
		height="48"
		viewBox="0 0 24 24"
		fill="none"
		stroke="#607d8b"
		strokeWidth="1"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
	</svg>



export const ThemeSwitcher = memo(() => {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();

	return (
		<Tooltip label="переключить тему" position="bottom">
			<ActionIcon variant="subtle" size="lg" onClick={toggleColorScheme}>
				{colorScheme === 'dark' ? BrightnessUpIcon : MoonIcon}
			</ActionIcon>
		</Tooltip>
	);
});
