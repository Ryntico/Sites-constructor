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
	Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { getRouteLogin } from '@const/router';
import { useSignup } from '@hooks/useSignup';

interface SignupFormValues {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export const SignupPage = () => {
	const navigate = useNavigate();
	const { handleSubmit, loading, error: authError } = useSignup();

	const form = useForm<SignupFormValues>({
		initialValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
		validate: {
			firstName: (value) =>
				value.trim().length >= 2
					? null
					: 'Имя должно содержать минимум 2 символа',
			lastName: (value) =>
				value.trim().length >= 2
					? null
					: 'Фамилия должна содержать минимум 2 символа',
			email: (value) =>
				/^\S+@\S+\.\S+$/.test(value) ? null : 'Некорректный email',
			password: (value) => {
				if (value.length < 8) return 'Пароль должен содержать минимум 8 символов';
				if (!/[A-Z]/.test(value))
					return 'Пароль должен содержать хотя бы одну заглавную букву';
				if (!/[0-9]/.test(value))
					return 'Пароль должен содержать хотя бы одну цифру';
				return null;
			},
			confirmPassword: (value, values) =>
				value === values.password ? null : 'Пароли не совпадают',
		},
		validateInputOnBlur: true,
	});

	const onSubmit = async (values: Omit<SignupFormValues, 'confirmPassword'>) => {
		await handleSubmit(values);
	};

	const isFormValid =
		form.isValid() &&
		Object.values(form.values).every((value) => value.trim() !== '');

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
				<form
					onSubmit={form.onSubmit(
						({ firstName, lastName, email, password }) => {
							return onSubmit({ firstName, lastName, email, password });
						},
					)}
				>
					<Stack gap="lg">
						<Title order={1} ta="center" fw={700}>
							Регистрация
						</Title>

						<Box style={{ display: 'flex', gap: '16px' }}>
							<TextInput
								label="Имя"
								placeholder="Введите имя"
								style={{ flex: 1 }}
								key={form.key('firstName')}
								{...form.getInputProps('firstName')}
								size="md"
							/>
							<TextInput
								label="Фамилия"
								placeholder="Введите фамилию"
								style={{ flex: 1 }}
								key={form.key('lastName')}
								{...form.getInputProps('lastName')}
								size="md"
							/>
						</Box>

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
							description="Пароль должен содержать минимум 8 символов, включая заглавную букву и цифру"
						/>

						<PasswordInput
							label="Повторите пароль"
							placeholder="Повторите пароль"
							key={form.key('confirmPassword')}
							{...form.getInputProps('confirmPassword')}
							size="md"
						/>

						{authError && (
							<Alert
								title="Ошибка регистрации"
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
							disabled={!isFormValid || loading}
							style={{
								backgroundColor: 'var(--mantine-color-dark-6)',
								color: 'white',
								marginTop: '16px',
							}}
						>
							Зарегистрироваться
						</Button>

						<Text ta="center" mt="md">
							Уже есть аккаунт?{' '}
							<Anchor
								component="button"
								type="button"
								onClick={() => navigate(getRouteLogin())}
								underline="always"
								fw={500}
							>
								Войти
							</Anchor>
						</Text>
					</Stack>
				</form>
			</Paper>
		</Container>
	);
};
