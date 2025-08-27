import type { PageSchema } from '@/types/siteTypes.ts';

export type HistoryState = { past: PageSchema[]; future: PageSchema[] };

const MAX_STEPS = 5;

export function loadHistory(key: string): HistoryState {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return { past: [], future: [] };
		const parsed = JSON.parse(raw) as HistoryState;
		return {
			past: Array.isArray(parsed?.past) ? parsed.past.slice(0, MAX_STEPS) : [],
			future: Array.isArray(parsed.future) ? parsed.future.slice(0, MAX_STEPS) : [],
		};
	} catch {
		return { past: [], future: [] };
	}
}

export function saveHistory(key: string, state: HistoryState) {
	try {
		localStorage.setItem(
			key,
			JSON.stringify({
				past: state.past.slice(-MAX_STEPS),
				future: state.future.slice(0, MAX_STEPS),
			}),
		);
	} catch {}
}

export function pushHistory(state: HistoryState, current: PageSchema): HistoryState {
	const snap = structuredClone(current);
	const nextPast = [...state.past, snap];
	return { past: nextPast.slice(-MAX_STEPS), future: [] };
}

export function canUndo(state: HistoryState) {
	return state.past.length > 0;
}
export function canRedo(state: HistoryState) {
	return state.future.length > 0;
}

export function undo(
	state: HistoryState,
	current: PageSchema,
): { state: HistoryState; schema?: PageSchema } {
	if (state.past.length === 0) return { state };
	const prev = state.past[state.past.length - 1];
	const newPast = state.past.slice(0, -1);
	const newFuture = [structuredClone(current), ...state.future].slice(0, MAX_STEPS);
	return { state: { past: newPast, future: newFuture }, schema: structuredClone(prev) };
}

export function redo(
	state: HistoryState,
	current: PageSchema,
): { state: HistoryState; schema?: PageSchema } {
	if (state.future.length === 0) return { state };
	const nextSchema = state.future[0];
	const newFuture = state.future.slice(1);
	const newPast = [...state.past, structuredClone(current)].slice(-MAX_STEPS);
	return {
		state: { past: newPast, future: newFuture },
		schema: structuredClone(nextSchema),
	};
}
