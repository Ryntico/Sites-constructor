import { useState } from 'react';
import { Button, TextInput, Group, Box, Paper, Text, ActionIcon } from '@mantine/core';
import { IconEdit, IconTrash, IconCheck } from './ui/icons';

export const SelectOptionsEditor = ({
  options = [],
  onChange,
}: {
  options: Array<{ value: string; text: string }>;
  onChange: (options: Array<{ value: string; text: string }>) => void;
}) => {
  const [newOption, setNewOption] = useState({ value: '', text: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddOption = () => {
    if (newOption.value && newOption.text) {
      const updatedOptions = [...options, { ...newOption }];
      onChange(updatedOptions);
      setNewOption({ value: '', text: '' });
    }
  };

  const handleUpdateOption = (index: number, field: 'value' | 'text', value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    onChange(updatedOptions);
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    onChange(updatedOptions);
  };

  return (
    <Box mt="md">
      <Group align="flex-end" gap="xs" mb="md">
        <TextInput
          placeholder="Значение"
          value={newOption.value}
          onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
          style={{ flex: 1, borderColor: 'var(--mantine-color-gray-3)', borderLeft: 0 }}
          size="xs"
        />
        <TextInput
          placeholder="Текст"
          value={newOption.text}
          onChange={(e) => setNewOption({ ...newOption, text: e.target.value })}
          style={{ flex: 1, borderColor: 'var(--mantine-color-gray-3)', borderLeft: 0 }}
          size="xs"
        />
        <Button 
          onClick={handleAddOption}
          disabled={!newOption.value || !newOption.text}
          size="xs"
          variant="default"
        >
          Добавить
        </Button>
      </Group>

      <Paper withBorder p="xs" style={{ maxHeight: 300, overflowY: 'auto' }}>
        {options.length === 0 ? (
          <Text c="dimmed" ta="center" size="sm" py="sm">
            Нет опций
          </Text>
        ) : (
          <Box>
            {options.map((option, index) => (
              <Paper 
                key={index} 
                withBorder 
                p="xs" 
                mb="xs"
                style={{ 
                  backgroundColor: editingIndex === index ? 'var(--mantine-color-gray-0)' : 'transparent',
                  borderColor: 'var(--mantine-color-gray-3)'
                }}
              >
                {editingIndex === index ? (
                  <Group gap="xs">
                    <TextInput
                      value={option.value}
                      onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
                      size="xs"
                      style={{ flex: 1 }}
                      variant="default"
                    />
                    <TextInput
                      value={option.text}
                      onChange={(e) => handleUpdateOption(index, 'text', e.target.value)}
                      size="xs"
                      style={{ flex: 1 }}
                      variant="default"
                    />
                    <ActionIcon 
                      variant="subtle" 
                      onClick={() => setEditingIndex(null)}
                      size="sm"
                    >
                      <IconCheck />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Group justify="space-between">
                    <Group gap="md">
                      <Text size="sm" style={{ minWidth: 100, color: 'var(--mantine-color-gray-8)' }}>
                        {option.value}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {option.text}
                      </Text>
                    </Group>
                    <Group gap={4}>
                      <ActionIcon 
                        size="sm" 
                        variant="subtle"
                        color="gray"
                        onClick={() => setEditingIndex(index)}
                      >
                        <IconEdit />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        variant="subtle" 
                        color="gray"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <IconTrash />
                      </ActionIcon>
                    </Group>
                  </Group>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
};