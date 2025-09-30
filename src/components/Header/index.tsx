import { Group, Box } from '@mantine/core';
import { HeaderNavigation } from './HeaderNavigation';
import { HeaderProfile } from './HeaderProfile';
import { ThemeSwitcher } from '@/components/ThemeSwitcher.tsx';

export const Header = () => {
	return (
		<Box
			component="header"
			h={60}
			style={{ borderBottom: '1px solid #ced4da' }}
		>
			<Group h="100%" px="md" justify="space-between" wrap="nowrap">
				<HeaderNavigation />
				<Group wrap="nowrap">
					<ThemeSwitcher />
					<HeaderProfile />
				</Group>
			</Group>
		</Box>
	);
};
