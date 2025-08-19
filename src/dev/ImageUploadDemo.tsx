import { useState } from 'react';
import { useImageUpload } from '@/hooks/useImageUpload';

export function ImageUploadDemo({ ownerId }: { ownerId: string | undefined }) {
	const { upload, cancel, reset, status, progress, url, error, isUploading } =
		useImageUpload();
	const [file, setFile] = useState<File | null>(null);

	return (
		<div
			style={{
				border: '1px solid #e6e8ef',
				borderRadius: 12,
				padding: 12,
				background: '#fff',
			}}
		>
			<div style={{ display: 'grid', gap: 8 }}>
				<input
					type="file"
					accept="image/*"
					onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)}
				/>

				<div style={{ display: 'flex', gap: 8 }}>
					<button
						onClick={async () => {
							if (!file || !ownerId) return;
							await upload(ownerId, file, {});
						}}
						disabled={!file || isUploading}
					>
						Загрузить
					</button>

					<button onClick={cancel} disabled={!isUploading}>
						Отменить
					</button>

					<button
						onClick={reset}
						disabled={
							isUploading && status !== 'error' && status !== 'success'
						}
					>
						Сбросить
					</button>
				</div>

				<div style={{ fontSize: 12, color: '#687087' }}>
					Статус: <b>{status}</b> {isUploading ? `• ${progress}%` : null}
					{error ? (
						<div style={{ color: '#d64545' }}>Ошибка: {error}</div>
					) : null}
				</div>

				{url ? (
					<div style={{ display: 'grid', gap: 6 }}>
						<div style={{ fontSize: 12, color: '#687087' }}>URL:</div>
						<a href={url} target="_blank" rel="noreferrer">
							{url}
						</a>
						<img
							src={url}
							alt="uploaded"
							style={{
								maxWidth: 240,
								borderRadius: 8,
								border: '1px solid #e6e8ef',
							}}
						/>
					</div>
				) : null}
			</div>
		</div>
	);
}
