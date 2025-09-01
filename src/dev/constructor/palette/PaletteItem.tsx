import type { JSX } from 'react';
import { Paper, Box, Text } from '@mantine/core';

type PaletteItemProps = {
  name: string;
  mimeKey: string;
  icon: JSX.Element;
};

export function PaletteItem({ name, mimeKey, icon }: PaletteItemProps) {
  return (
      <Paper
          withBorder
          p="md"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/x-block-template', mimeKey);
            e.dataTransfer.effectAllowed = 'copy';
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            minHeight: 80,
            height: '100%',
            userSelect: 'none',
          }}
          title={name}
      >
        <Box mb="xs">
          {icon}
        </Box>
        <Text
            size="12"
            c="dimmed"
            ta="center"
            style={{ lineHeight: 1.2 }}
        >
          {name}
        </Text>
      </Paper>
  );
}