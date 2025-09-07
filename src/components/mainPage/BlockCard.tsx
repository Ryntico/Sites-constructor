import React from "react";
import { Button, Card, Text, Group, Center } from '@mantine/core';

interface BlockCardProps {
  block: { id: string; name: string };
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, onDelete, onEdit }) => {
  const handlerEdit = () => onEdit(block.id);
  const handlerDelete = () => onDelete(block.id)

  return (
    <Card shadow="sm" padding="xl" radius="md" miw={300} maw={400} withBorder>
      <Center>
          <Text >{block.name}</Text>
      </Center>
      <Group mt="md" justify="space-evenly">
        <Button onClick={handlerEdit} variant="light" w={100}>
          Edit
        </Button>
        <Button color="red" onClick={handlerDelete} variant="light" w={100}>
          Delete
        </Button>
      </Group>
    </Card>
  );
};
