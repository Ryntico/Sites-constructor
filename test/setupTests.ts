import '@testing-library/jest-dom';

if (typeof (globalThis as any).DragEvent === 'undefined') {
	class DragEventPolyfill extends Event {
		dataTransfer: DataTransfer | null;
		constructor(
			type: string,
			eventInitDict?: EventInit & { dataTransfer?: DataTransfer },
		) {
			super(type, eventInitDict);
			this.dataTransfer = (eventInitDict as any)?.dataTransfer ?? null;
		}
	}
	(globalThis as any).DragEvent = DragEventPolyfill as any;
}
