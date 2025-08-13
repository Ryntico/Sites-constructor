import React from 'react';
import { Box } from '@mantine/core';
import { SideMenu } from '@pages/constructor/SideMenu.tsx';

export const ConstructorPage = () => {
	return (
		<Box display="flex" h="calc(100vh - 60px)">
			<SideMenu />
			<Box flex="1" bg="aqua" pos="relative"></Box>
		</Box>
	);
};
