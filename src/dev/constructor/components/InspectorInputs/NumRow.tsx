import { NumberRow } from './NumberRow.tsx';

function toNumStr(v: number | string | undefined): string {
	if (typeof v === 'number') return String(v);
	if (typeof v === 'string') {
		const n = Number(v);
		return Number.isFinite(n) ? String(n) : '';
	}
	return '';
}

function strToNumOrUndef(s: string): number | undefined {
	const n = Number(s);
	return Number.isFinite(n) ? n : undefined;
}

export function NumRow({
						   label,
						   value,
						   onChange,
						   title,
					   }: {
	label: string;
	value: number | undefined;
	onChange: (v: number | undefined) => void;
	title?: string;
}) {
	return (
		<NumberRow
			label={label}
			value={toNumStr(value)}
			onChange={(v) => onChange(strToNumOrUndef(v))}
			title={title}
		/>
	);
}