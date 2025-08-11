import React from 'react';
import { Menu, Avatar } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { getRouteProfile } from '../../const/router';

// TODO: убрать хардкод в Avatar
export const HeaderProfile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: реализовать выход из системы
    console.log('HeaderProfile -> handleLogout');
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Avatar
          size="md"
          radius="xl"
          style={{ cursor: 'pointer' }}
        >
          👤
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() => navigate(getRouteProfile())}
        >
          Профиль
        </Menu.Item>
        <Menu.Item
          onClick={handleLogout}
          color="red"
        >
          Выход
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
