import React, { useState } from 'react';
import { Container, Paper } from '@mantine/core';
import { ProfileView } from './ProfileView.tsx';
import { ProfileEdit } from './ProfileEdit.tsx';

export const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => setIsEditing(false);

  // TODO заменить на user из редакса
  const authData = {
    email: 'bruh@bruh.com',
    lastName: 'Андрей',
    firstName: 'Андрееей'
  }

  return (
    <Container size="xs" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
          {isEditing ? (
            <ProfileEdit
              user={authData} 
              onSave={handleSave}
            />
          ) : (
            <ProfileView user={authData} editCallback={handleEdit} />
          )}
      </Paper>
    </Container>
  );
};
