import { useState } from 'react';
import { Button, TextInput, Group, Box, Paper, Text, ActionIcon } from '@mantine/core';

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4V20H20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.278 1.87868 20.554 1.93355 20.8123 2.04015C21.0706 2.14676 21.3063 2.30324 21.505 2.50098C21.7038 2.69871 21.862 2.93387 21.97 3.19148C22.078 3.44909 22.1339 3.72398 22.1345 4.00198C22.1352 4.27998 22.0806 4.55518 21.9738 4.81318C21.8671 5.07119 21.7101 5.30708 21.5125 5.50648L12.293 14.726L8 16L9.274 11.707L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
                      <CheckIcon />
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
                        <EditIcon />
                      </ActionIcon>
                      <ActionIcon 
                        size="sm" 
                        variant="subtle" 
                        color="gray"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <TrashIcon />
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