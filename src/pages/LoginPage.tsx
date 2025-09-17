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
	Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { getRouteSignup } from '@const/router';
import { useLogin, type LoginFormValues } from '@hooks/useLogin';
import { notifications } from '@mantine/notifications';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/services/firebase/app';
import { useEffect, useState } from 'react';
import { FirebaseError } from 'firebase/app';

export const LoginPage = () => {
	const navigate = useNavigate();
	const { handleSubmit, loading, error: authError } = useLogin();
	const [resetBusy, setResetBusy] = useState(false);
	const [resetUntil, setResetUntil] = useState<number>(0);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_tick, setTick] = useState(0);

	const form = useForm<LoginFormValues>({
		initialValues: {
			email: '',
			password: '',
		},
		validate: {
			email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Некорректный email'),
			password: (value) =>
				value.length >= 8 ? null : 'Пароль должен содержать минимум 8 символов',
		},
	});

	const emailValid = /^\S+@\S+$/.test(form.values.email);
	const now = Date.now();
	const left = Math.max(0, Math.ceil((resetUntil - now) / 1000));
	const canSend = emailValid && !resetBusy && left === 0;

	useEffect(() => {
		if (left <= 0) return;
		const t = setInterval(() => setTick((x) => x + 1), 1000);
		return () => clearInterval(t);
	}, [left]);

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
					marginTop: '10vh',
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

						<Tooltip
							label={
								emailValid
									? left > 0
										? `Можно повторно через ${left} с`
										: 'Отправить письмо для сброса пароля'
									: 'Для восстановления введите корректный email'
							}
							position="right"
							withArrow
						>
							<Text size="xs" ta="right" mt={-6}>
								<Anchor
									component="button"
									type="button"
									onClick={async () => {
										if (!canSend) return;
										try {
											setResetBusy(true);
											await sendPasswordResetEmail(
												auth,
												form.values.email,
											);
											setResetUntil(Date.now() + 60_000);
											notifications.show({
												title: 'Письмо отправлено',
												message: `Инструкции отправлены на ${form.values.email}`,
												color: 'blue',
											});
										} catch (err) {
											const e = err as FirebaseError;
											console.error(
												'reset error',
												e.code,
												e.message,
											);
											notifications.show({
												title: 'Ошибка',
												message: `${e.code}: ${e.message}`,
												color: 'red',
											});
										} finally {
											setResetBusy(false);
										}
									}}
									style={{
										padding: 0,
										color: 'var(--mantine-color-blue-6)',
										opacity: canSend ? 1 : 0.55,
										cursor: canSend ? 'pointer' : 'default',
									}}
								>
									Забыли пароль?
								</Anchor>
								{left > 0 && (
									<Text span size="xs" c="dimmed">
										{' '}
										• повторно через {left} с
									</Text>
								)}
							</Text>
						</Tooltip>

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
								color: 'white',
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
