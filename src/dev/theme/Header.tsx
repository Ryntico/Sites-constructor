import { Group, Title, Button } from '@mantine/core';

export function Header({ onReset }: { onReset?: () => void }) {
	return (
		<Group justify="space-between" align="center">
			<Title order={4}>Редактор темы</Title>
			{onReset && (
				<Button
					onClick={onReset}
					variant="outline"
					size="xs"
				>
					Сбросить к дефолту
				</Button>
			)}
		</Group>
	);
}