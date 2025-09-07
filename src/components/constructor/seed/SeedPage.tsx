import { seedTemplatesClient } from './seedTemplatesClient.ts';

export function SeedPage() {
	return (
		<div style={{ padding: 24 }}>
			<button onClick={seedTemplatesClient}>Залить шаблоны в Firestore</button>
			<div style={{ opacity: 0.6, marginTop: 8 }}>
				Работает только в DEV/под админом.
			</div>
		</div>
	);
}
