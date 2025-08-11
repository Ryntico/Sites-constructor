import React, { memo } from 'react';
import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';

export const ThemeSwitcher = memo(() => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    return (
        <Tooltip
            label='переключить тему'
            position="bottom"
        >
            <ActionIcon
                variant="subtle"
                size="lg"
                onClick={toggleColorScheme}
            >
                {colorScheme === 'dark' ? '☀️' : '🌙'}
            </ActionIcon>
        </Tooltip>
    );
});