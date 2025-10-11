import { Group, Box, Divider } from '@mantine/core';
import { HeaderNavigation } from './HeaderNavigation';
import { HeaderProfile } from './HeaderProfile';
import { ThemeSwitcher } from '@/components/ThemeSwitcher.tsx';

export const Header = () => {
	return (
		<>
			<Box
				component="header"
				h={60}
			>
				<Group h="100%" px="md" justify="space-between" wrap="nowrap">
					<HeaderNavigation />
					<Group wrap="nowrap">
						<ThemeSwitcher />
						<HeaderProfile />
					</Group>
				</Group>
			</Box>
			<Divider />
		</>

	);
};
