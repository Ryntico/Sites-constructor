import {
	createImageUploadTask,
	type ImageUploadOptions,
	type ImageUploadResult,
	waitForImageUpload,
} from '@/services/firebase/storage.ts';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UploadTask, UploadTaskSnapshot } from 'firebase/storage';

export type UploadStatus = 'idle' | 'running' | 'success' | 'error' | 'canceled';

export interface UseImageUpload {
	upload: (
		ownerId: string,
		file: File,
		opts?: ImageUploadOptions,
	) => Promise<ImageUploadResult>;
	cancel: () => void;
	reset: () => void;

	status: UploadStatus;
	progress: number;
	url: string | null;
	path: string | null;
	error: string | null;
	isUploading: boolean;
}

export function useImageUpload(): UseImageUpload {
	const [status, setStatus] = useState<UploadStatus>('idle');
	const [progress, setProgress] = useState<number>(0);
	const [url, setUrl] = useState<string | null>(null);
	const [path, setPath] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const taskRef = useRef<UploadTask | null>(null);
	const unsubRef = useRef<(() => void) | null>(null);

	const cleanupListener = () => {
		if (unsubRef.current) {
			unsubRef.current();
			unsubRef.current = null;
		}
	};

	useEffect(() => cleanupListener, []);

	const reset = useCallback(() => {
		cleanupListener();
		taskRef.current?.cancel();
		taskRef.current = null;

		setStatus('idle');
		setProgress(0);
		setUrl(null);
		setPath(null);
		setError(null);
	}, []);

	const cancel = useCallback(() => {
		if (taskRef.current) {
			taskRef.current.cancel();
			setStatus('canceled');
		}
		cleanupListener();
	}, []);

	const upload = useCallback(
		async (
			ownerId: string,
			file: File,
			opts?: ImageUploadOptions,
		): Promise<ImageUploadResult> => {
			reset();
			setStatus('running');

			const { task, path: storagePath } = createImageUploadTask(
				ownerId,
				file,
				opts,
			);
			taskRef.current = task;

			unsubRef.current = task.on(
				'state_changed',
				(snap: UploadTaskSnapshot) => {
					const pct = Math.round(
						(snap.bytesTransferred / snap.totalBytes) * 100,
					);
					setProgress(pct);
				},
				(err) => {
					setError(err.message);
					setStatus('error');
					cleanupListener();
				},
			);

			try {
				const result = await waitForImageUpload(task);
				setUrl(result.url);
				setPath(storagePath);
				setStatus('success');
				cleanupListener();
				return result;
			} catch (e) {
				if (status !== 'canceled') {
					setError(e instanceof Error ? e.message : String(e));
					setStatus('error');
				}
				cleanupListener();
				throw e;
			} finally {
				taskRef.current = null;
			}
		},
		[reset, status],
	);

	return {
		upload,
		cancel,
		reset,
		status,
		progress,
		url,
		path,
		error,
		isUploading: status === 'running',
	};
}
