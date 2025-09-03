/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
	PageSchema,
	ThemeTokens,
	NodeSubtree,
	NodeJson,
} from '../src/types/siteTypes';

export function makeTheme(partial: Partial<ThemeTokens> = {}): ThemeTokens {
	return {
		shadow: { sm: '', md: '', lg: '', ...(partial.shadow || {}) },
		spacing: {
			4: 4,
			6: 6,
			8: 8,
			10: 10,
			12: 12,
			16: 16,
			20: 20,
			24: 24,
			28: 28,
			32: 32,
			36: 36,
			40: 40,
			48: 48,
			56: 56,
			64: 64,
			...(partial.spacing || {}),
		},
		colors: {
			text: {
				base: '#111827',
				muted: '#6b7280',
				onPrimary: '#fff',
				...(partial.colors?.text || {}),
			},
			surface: '#fff',
			page: '#fff',
			primary: {
				500: '#6366F1',
				600: '#5248e5',
				outline: '#C7D2FE',
				...(partial.colors?.primary || {}),
			},
			border: '#e6e8ef',
			...(partial.colors || {}),
		},
		breakpoints: { sm: 640, md: 768, lg: 1024, ...(partial.breakpoints || {}) },
		radius: { sm: 6, md: 10, lg: 14, xl: 18, ...(partial.radius || {}) },
		typography: {
			sizes: {
				sm: 12,
				base: 14,
				md: 16,
				lg: 20,
				xl: 28,
				...(partial.typography?.sizes || {}),
			},
			lineHeights: {
				sm: 1.2,
				base: 1.4,
				md: 1.6,
				lg: 1.6,
				xl: 1.2,
				...(partial.typography?.lineHeights || {}),
			},
			fontFamily: partial.typography?.fontFamily || 'Inter, system-ui, sans-serif',
		},
	};
}

export function makeSchemaEmptyContainer(): PageSchema {
	return {
		rootId: 'page',
		nodes: {
			page: {
				id: 'page',
				type: 'page',
				props: { style: { base: {} } },
				childrenOrder: ['section1'],
			},
			section1: {
				id: 'section1',
				type: 'section',
				props: { style: { base: { display: 'flex', flexDirection: 'column' } } },
				childrenOrder: [],
			},
		},
	};
}

export function makeSchemaWithChild(): PageSchema {
	return {
		rootId: 'page',
		nodes: {
			page: {
				id: 'page',
				type: 'page',
				props: { style: { base: {} } },
				childrenOrder: ['section1'],
			},
			section1: {
				id: 'section1',
				type: 'section',
				props: { style: { base: { display: 'flex', flexDirection: 'column' } } },
				childrenOrder: ['h1'],
			},
			h1: {
				id: 'h1',
				type: 'heading',
				props: { level: 1, text: 'Hello', style: { base: {} } },
			},
		},
	};
}

export function tplH1(): NodeSubtree {
	const nodes: Record<string, NodeJson> = {
		n1: {
			id: 'n1',
			type: 'heading',
			props: { level: 2, text: 'T', style: { base: {} } },
		},
	};
	return { rootId: 'n1', nodes };
}

export class DTMock implements DataTransfer {
	dropEffect: 'none' | 'copy' | 'link' | 'move' = 'none';
	effectAllowed:
		| 'none'
		| 'copy'
		| 'link'
		| 'move'
		| 'copyLink'
		| 'copyMove'
		| 'linkMove'
		| 'all'
		| 'uninitialized' = 'all';
	files: FileList = {} as unknown as FileList;
	items: DataTransferItemList = {} as unknown as DataTransferItemList;
	types: readonly string[] = [];
	private store = new Map<string, string>();
	setData(type: string, data: string): void {
		this.store.set(type, data);
		this.types = Array.from(new Set([...this.types, type]));
	}
	getData(type: string): string {
		return this.store.get(type) || '';
	}
	clearData(format?: string): void {
		format ? this.store.delete(format) : this.store.clear();
	}
	setDragImage(_img: Element, _x: number, _y: number): void {}
}
