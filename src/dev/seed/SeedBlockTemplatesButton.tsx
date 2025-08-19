import { useState } from 'react';
import { seedBlockTemplates } from '@/dev/seed/seedBlockTemplates';

export function SeedBlockTemplatesButton() {
	const [busy, setBusy] = useState(false);
	const [msg, setMsg] = useState('');

	return (
		<div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
			<button
				disabled={busy}
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
				style={{
					padding: '6px 10px',
					borderRadius: 8,
					border: '1px solid #d0d3dc',
					background: busy ? '#f1f3f5' : '#fff',
					cursor: busy ? 'default' : 'pointer',
					fontSize: 12,
				}}
			>
				{busy ? 'Синхронизирую…' : 'Обновить блок-шаблоны'}
			</button>
			<span style={{ fontSize: 12, color: '#687087' }}>{msg}</span>
		</div>
	);
}
