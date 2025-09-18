import { useState } from 'react';
import { Button, Text, Group } from '@mantine/core';
import { seedBlockTemplates } from '@/components/constructor/seed/seedBlockTemplates.ts';

export function SeedBlockTemplatesButton() {
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState('');

	return (
		<Group gap="xs" align="center">
			<Button
				size="xs"
				variant="outline"
				loading={busy}
				onClick={async () => {
					setBusy(true);
					try {
						const res = await seedBlockTemplates({ archiveMissing: false });
						setMsg(
							`OK: +${res.created} created, ${res.updated} updated${res.archived ? `, ${res.archived} archived` : ''}`,
						);
					} catch (e) {
						setMsg(`ERR: ${e instanceof Error ? e.message : String(e)}`);
					} finally {
						setBusy(false);
					}
				}}
			>
				{busy ? 'Синхронизирую…' : 'Обновить блок-шаблоны'}
			</Button>
			<Text size="sm" c="dimmed">
				{msg}
			</Text>
		</Group>
	);
}