import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Center, Container, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle } from '../ui/icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('errorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Center h="100vh">
          <Container size="sm" p="lg">
            <Stack align="center" gap="md">
              <IconAlertTriangle />
              <Title order={2} ta="center">
                Что-то пошло не так
              </Title>
              <Text ta="center">
                Произошла непредвиденная ошибка. Пожалуйста, попробуйте перезагрузить страницу.
              </Text>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details style={{ marginTop: '1rem', color: 'red' }}>
                  <summary>Подробности ошибки (только для разработки)</summary>
                  <pre>{this.state.error.toString()}</pre>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </details>
              )}
            </Stack>
          </Container>
        </Center>
      );
    }

    return this.props.children;
  }
}
