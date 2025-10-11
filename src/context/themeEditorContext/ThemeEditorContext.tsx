import { createContext, type ReactNode } from 'react';
import type { ThemeTokens } from '@/types/siteTypes.ts';
import type { JSONContent } from '@tiptap/react';

interface ThemeEditorContextType {
	set: (path: (string | number)[], value: unknown) => void;
	num: (v: number | string, fallback: number) => number;
}

export const ThemeEditorContext = createContext<ThemeEditorContextType | null>(null);

export function ThemeEditorProvider({
										children,
										theme,
										onChange,
									}: {
	children: ReactNode;
	theme: ThemeTokens;
	onChange: (next: ThemeTokens) => void;
}) {
	const set = (path: (string | number)[], value: unknown) => {
		const next = structuredClone(theme);
		let cur = next as JSONContent;
		for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
		cur[path[path.length - 1]] = value;
		onChange(next);
	};

	const num = (v: number | string, fallback: number) => {
		const n = typeof v === 'number' ? v : Number(v);
		return Number.isFinite(n) ? n : fallback;
	};

	return (
		<ThemeEditorContext.Provider value={{ set, num }}>
			{children}
		</ThemeEditorContext.Provider>
	);
}