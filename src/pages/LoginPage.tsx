import React from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Anchor,
  Stack,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { getRouteSignup } from "../const/router";
import { useLogin, type LoginFormValues } from '../hooks/useLogin';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { handleSubmit, loading, error: authError } = useLogin();

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
      password: (value) => (value.length >= 8 ? null : 'Пароль должен содержать минимум 8 символов'),
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    void handleSubmit(values, () => navigate('/'));
  };

  return (
    <Container size="xs" py="xl">
      <Paper 
        shadow="sm" 
        p="xl" 
        radius="md" 
        withBorder
        style={{ 
          maxWidth: 400, 
          margin: '0 auto',
          marginTop: '10vh'
        }}
      >
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Stack gap="lg">
            <Title order={1} ta="center" fw={700}>
              Login
            </Title>

            <TextInput
              label="Электронная почта"
              placeholder="Введите email"
              key={form.key('email')}
              {...form.getInputProps('email')}
              size="md"
            />

            <PasswordInput
              label="Пароль"
              placeholder="Введите пароль"
              key={form.key('password')}
              {...form.getInputProps('password')}
              size="md"
            />

            {authError && (
              <Alert
                title="Ошибка входа"
                color="red"
                variant="light"
                mt="xs"
              >
                {authError}
              </Alert>
            )}

            <Button
              type="submit"
              size="md"
              fullWidth
              loading={loading}
              disabled={loading}
              style={{
                backgroundColor: 'var(--mantine-color-dark-6)',
                color: 'white'
              }}
            >
              Войти
            </Button>

            <Text ta="center" size="sm" c="dimmed">
              Нет аккаунта ?{' '}
              <Anchor 
                size="sm" 
                onClick={() => navigate(getRouteSignup())}
                style={{ cursor: 'pointer' }}
              >
                Зарегистрироваться
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};
