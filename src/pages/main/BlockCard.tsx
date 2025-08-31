import React from "react";
import { Button, Card, Text , Group} from '@mantine/core';

interface BlockCardProps {
  block: { id: number; name: string };
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, onDelete, onEdit }) => {
  const handlerEdit = () => onEdit(block.id);
  const handlerDelete = () => onDelete(block.id)

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Text>{block.name}</Text>
      <Group mt="md">
        <Button onClick={handlerEdit} variant="light">
          Edit
        </Button>
        <Button color="red" onClick={handlerDelete} variant="light">
          Delete
        </Button>
      </Group>
    </Card>
  );
};
