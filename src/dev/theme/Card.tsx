import { Paper, Title } from '@mantine/core';

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<Paper withBorder p="md">
			<Title order={5} mb="sm">{title}</Title>
			{children}
		</Paper>
	);
}