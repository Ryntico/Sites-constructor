import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Center, Container, Stack, Text, Title } from '@mantine/core';

const IconAlertTriangle = () =>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#607d8b"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
      <path d="M12 9v4" />
      <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
      <path d="M12 16h.01" />
    </svg>


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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
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
