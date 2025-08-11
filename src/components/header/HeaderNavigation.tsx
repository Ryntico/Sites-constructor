import React from 'react';
import { Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { getRouteMain, getRouteNewProject } from '../../const/router';

export const HeaderNavigation = () => {
  const navigate = useNavigate();

  return (
    <Group>
      <Button
        variant="subtle"
        onClick={() => navigate(getRouteMain())}
      >
        Главная
      </Button>
      <Button
        variant="subtle"
        onClick={() => navigate(getRouteNewProject())}
      >
        Новый сайт
      </Button>
    </Group>
  );
};
