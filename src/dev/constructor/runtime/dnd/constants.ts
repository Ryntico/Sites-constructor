export const TYPE_MOVE = 'application/x-move-node';
export const TYPE_TPL = 'application/x-block-template';
export const TYPE_COPY_INTENT = 'application/x-copy-intent';

export const IS_MAC =
	typeof navigator !== 'undefined' &&
	(/Mac|iPhone|iPad|iPod/i.test(navigator.platform) ||
		/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent));
