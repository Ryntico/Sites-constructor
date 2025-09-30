import { Button, Modal, TextInput } from '@mantine/core';
import { useState } from 'react';

type SaveTemplateModalProps = {
  opened: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  loading?: boolean;
};

export function SaveTemplateModal({ opened, onClose, onSave, loading }: SaveTemplateModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Введите название шаблона');
      return;
    }
    onSave(name);
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Сохранить как шаблон">
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Название шаблона"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          placeholder="Мой шаблон"
          autoFocus
          data-autofocus
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Button variant="default" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" loading={loading}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
}
