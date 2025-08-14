import { useCallback, useEffect, useRef } from 'react';

export function useDebounce<Args extends unknown[]>(
	fn: (...args: Args) => void,
	delay: number,
) {
	const fnRef = useRef(fn);
	const tRef = useRef<number | null>(null);

	useEffect(() => {
		fnRef.current = fn;
	}, [fn]);

	const debounced = useCallback(
		(...args: Args) => {
			if (tRef.current) window.clearTimeout(tRef.current);
			tRef.current = window.setTimeout(() => {
				tRef.current = null;
				fnRef.current(...args);
			}, delay);
		},
		[delay],
	);

	const cancel = useCallback(() => {
		if (tRef.current) {
			window.clearTimeout(tRef.current);
			tRef.current = null;
		}
	}, []);

	return { debounced, cancel };
}
