import {
	getStorage,
	ref,
	uploadBytesResumable,
	getDownloadURL,
	deleteObject,
	type StorageReference,
	type UploadTask,
	type UploadTaskSnapshot,
} from 'firebase/storage';

export interface ImageUploadOptions {
	pathPrefix?: string;
	cacheControl?: string;
	maxBytes?: number;
	allowedMime?: readonly string[];
}

export interface ImageUploadResult {
	url: string;
	path: string;
	contentType: string | null;
	size: number;
	ref: StorageReference;
}

function buildStoragePath(ownerId: string, fileName: string, prefix: string): string {
	const d = new Date();
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	const ts = d.getTime();

	const dot = fileName.lastIndexOf('.');
	const ext = dot > -1 ? fileName.slice(dot + 1).toLowerCase() : '';
	const nameOnly =
		(dot > -1 ? fileName.slice(0, dot) : fileName)
			.normalize('NFKD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-zA-Z0-9._-]+/g, '-')
			.replace(/-{2,}/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 40) || 'image';

	const rand = Math.random().toString(36).slice(2, 8);
	const fname = ext ? `${ts}_${rand}_${nameOnly}.${ext}` : `${ts}_${rand}_${nameOnly}`;
	return `${prefix}/${ownerId}/images/${yyyy}/${mm}/${dd}/${fname}`;
}

function validateImageFile(file: File, opts: ImageUploadOptions): void {
	const maxBytes = opts.maxBytes ?? 10 * 1024 * 1024;
	const allowed = opts.allowedMime ?? ['image/*'];

	if (file.size > maxBytes) {
		throw new Error(
			`Файл слишком большой (${Math.round(file.size / 1024 / 1024)}MB), лимит ${Math.round(maxBytes / 1024 / 1024)}MB`,
		);
	}
	const ok = allowed.some((pat) =>
		pat.endsWith('/*') ? file.type.startsWith(pat.slice(0, -1)) : file.type === pat,
	);
	if (!ok) {
		throw new Error(`Недопустимый тип файла: ${file.type}`);
	}
}

export function createImageUploadTask(
	ownerId: string,
	file: File,
	options: ImageUploadOptions = {},
): { task: UploadTask; ref: StorageReference; path: string } {
	validateImageFile(file, options);

	const storage = getStorage();
	const prefix = options.pathPrefix ?? 'users';
	const path = buildStoragePath(ownerId, file.name, prefix);
	const storageRef = ref(storage, path);

	const metadata = {
		contentType: file.type,
		cacheControl: options.cacheControl ?? 'public, max-age=3153600, immutable',
	};

	const task = uploadBytesResumable(storageRef, file, metadata);
	return { task, ref: storageRef, path };
}

export function waitForImageUpload(task: UploadTask): Promise<ImageUploadResult> {
	return new Promise<ImageUploadResult>((resolve, reject) => {
		task.on('state_changed', undefined, reject, async () => {
			const snap: UploadTaskSnapshot = task.snapshot;
			const url = await getDownloadURL(snap.ref);
			resolve({
				url,
				path: snap.ref.fullPath,
				contentType: snap.metadata.contentType ?? null,
				size: snap.totalBytes,
				ref: snap.ref,
			});
		});
	});
}

export async function deleteImageByPath(path: string): Promise<void> {
	const storage = getStorage();
	const storageRef = ref(storage, path);
	await deleteObject(storageRef);
}
