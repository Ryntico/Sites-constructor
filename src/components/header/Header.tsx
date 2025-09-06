import { Group, Box } from '@mantine/core';
import { HeaderNavigation } from './HeaderNavigation';
import { HeaderProfile } from './HeaderProfile';
import { ThemeSwitcher } from '@components/themeSwitcher/ThemeSwitcher';

export const Header = () => {
	return (
		<Box
			component="header"
			h={60}
			style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
		>
			<Group h="100%" px="md" justify="space-between">
				<HeaderNavigation />
				<Group>
					<ThemeSwitcher />
					<HeaderProfile />
				</Group>
			</Group>
		</Box>
	);
};
