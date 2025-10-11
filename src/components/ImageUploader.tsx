import { useEffect, useMemo, useRef, useState } from 'react';
import { useImageUpload } from '@hooks/useImageUpload.ts';
import {
	Alert,
	Badge,
	Box,
	Button,
	Group,
	Image,
	Paper,
	Progress,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload, IconX } from '@/components/ui/icons';

type Props = {
	ownerId?: string;
	onUploaded: (url: string) => void;
	accept?: string;
	buttonLabel?: string;
};

export function ImageUploader({
	ownerId,
	onUploaded,
	accept = 'image/*',
	buttonLabel = 'Загрузить',
}: Props) {
	const { upload, cancel, reset, progress, url, error, isUploading } = useImageUpload();

	const [file, setFile] = useState<File | null>(null);
	const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
	const inputRef = useRef<HTMLInputElement | null>(null);

	useEffect(
		() => () => {
			if (preview) URL.revokeObjectURL(preview);
		},
		[preview],
	);

	useEffect(() => {
		if (!url) return;
		onUploaded(url);
		reset();
		setFile(null);
	}, [url, onUploaded, reset]);

	const disabledPick = !ownerId || isUploading;
	const canUpload = !!ownerId && !!file && !isUploading;

	const dzAccept =
		accept === 'image/*'
			? IMAGE_MIME_TYPE
			: Array.from(
					new Set(
						accept
							.split(',')
							.map((s) => s.trim())
							.filter(Boolean),
					),
				);

	return (
		<Stack gap="xs">
			{!ownerId && (
				<Alert color="gray" variant="light" title="Загрузка недоступна">
					<Text size="sm">Авторизуйтесь, чтобы загрузить изображение.</Text>
				</Alert>
			)}

			<Paper withBorder radius="md" p="md">
				<Dropzone
					accept={dzAccept}
					disabled={disabledPick}
					onDrop={(files) => {
						const f = files?.[0];
						if (f) setFile(f);
					}}
					multiple={false}
					styles={{
						root: {
							borderStyle: 'dashed',
							cursor: disabledPick ? 'default' : 'pointer',
							background: '#fff',
						},
					}}
				>
					{preview ? (
						<Image
							src={preview}
							alt="preview"
							radius="sm"
							mah={180}
							fit="contain"
						/>
					) : (
						<Stack align="center" gap={4} mih={120} justify="center">
							<ThemeIcon variant="light" radius="xl" color="gray" size="lg">
								<IconPhoto />
							</ThemeIcon>
							<Text size="sm" c="dark.6">
								{ownerId
									? 'Перетащите изображение сюда'
									: 'Не авторизованы'}
							</Text>
							<Text size="xs" c="dimmed">
								{ownerId
									? '… или нажмите, чтобы выбрать'
									: 'Загрузка недоступна'}
							</Text>
							<input
								ref={inputRef}
								type="file"
								accept={accept}
								style={{ display: 'none' }}
								disabled={disabledPick}
								onChange={(e) => {
									const f = e.currentTarget.files?.[0] ?? null;
									if (f) setFile(f);
								}}
							/>
						</Stack>
					)}
				</Dropzone>
			</Paper>

			<Group gap="xs" wrap="wrap">
				<Button
					leftSection={<IconUpload />}
					onClick={() => file && ownerId && upload(ownerId, file, {})}
					disabled={!canUpload}
					variant="filled"
					color="indigo"
					size="xs"
				>
					{isUploading ? `Загрузка… ${progress}%` : buttonLabel}
				</Button>

				<Button
					leftSection={<IconX />}
					onClick={cancel}
					disabled={!isUploading}
					variant="outline"
					size="xs"
				>
					Отменить
				</Button>

				<Button
					onClick={() => {
						reset();
						setFile(null);
					}}
					disabled={isUploading || !file}
					variant="subtle"
					size="xs"
					color="gray"
				>
					Сбросить
				</Button>
			</Group>

			{file && !isUploading && (
				<Group gap="xs">
					<Badge color="gray" variant="light" radius="sm" title={file.name}>
						{file.name}
					</Badge>
					<Text size="xs" c="dimmed">
						{formatBytes(file.size)}
					</Text>
				</Group>
			)}

			{isUploading && (
				<Box>
					<Progress
						value={Math.max(3, progress)}
						animated
						color="indigo"
						radius="xl"
						size="sm"
					/>
				</Box>
			)}

			{!!error && (
				<Alert color="red" variant="light" title="Ошибка загрузки">
					<Text size="sm">{error}</Text>
				</Alert>
			)}
		</Stack>
	);
}

function formatBytes(n: number) {
	if (!n) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(n) / Math.log(k));
	const v = parseFloat((n / Math.pow(k, i)).toFixed(2));
	return `${v} ${sizes[i]}`;
}
