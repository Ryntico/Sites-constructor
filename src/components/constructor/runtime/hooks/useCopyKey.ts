import { useEffect, useRef } from 'react';
import { isCopyKeyLike } from '@components/constructor/runtime/dnd/utils.ts';

export function useCopyKey(isMac: boolean) {
	const ref = useRef(false);

	useEffect(() => {
		const fromKey = (e: KeyboardEvent) => {
			ref.current = isCopyKeyLike(e, isMac);
		};
		const fromDragOver = (e: DragEvent) => {
			ref.current = isCopyKeyLike(e, isMac);
		};
		const reset = () => {
			ref.current = false;
		};
		const onVis = () => {
			if (document.visibilityState !== 'visible') reset();
		};

		window.addEventListener('keydown', fromKey, true);
		window.addEventListener('keyup', fromKey, true);
		window.addEventListener('dragover', fromDragOver, true);
		window.addEventListener('dragend', reset, true);
		window.addEventListener('drop', reset, true);
		window.addEventListener('blur', reset, true);
		document.addEventListener('visibilitychange', onVis, true);
		return () => {
			window.removeEventListener('keydown', fromKey, true);
			window.removeEventListener('keyup', fromKey, true);
			window.removeEventListener('dragover', fromDragOver, true);
			window.removeEventListener('dragend', reset, true);
			window.removeEventListener('drop', reset, true);
			window.removeEventListener('blur', reset, true);
			document.removeEventListener('visibilitychange', onVis, true);
		};
	}, [isMac]);

	return ref as React.RefObject<boolean>;
}
