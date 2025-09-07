import { TokenSelect } from './TokenSelect.tsx';

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

export function NumOrTokenRow({
								  label,
								  value,
								  onNumChange,
								  tokenValue,
								  onTokenChange,
								  tokenOptions,
							  }: {
	label: string;
	value: number | string | undefined;
	onNumChange: (v: number | undefined) => void;
	tokenValue: string;
	onTokenChange: (tok: string) => void;
	tokenOptions: [string, string][];
}) {
	const isTok = typeof value === 'string' && value.startsWith('token:');

	return (
		<div>
			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>{label}</div>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
				<input
					type="number"
					style={{
						width: '100%',
						border: '1px solid #d0d3dc',
						borderRadius: 8,
						padding: '6px 8px',
						fontSize: 13,
					}}
					value={isTok ? '' : toNumStr(value as number | undefined)}
					onChange={(e) => onNumChange(strToNumOrUndef(e.target.value))}
					placeholder="px"
					disabled={isTok}
				/>
				<TokenSelect
					value={tokenValue}
					onChange={(tok) => onTokenChange(tok === '__none__' ? '' : tok)}
					options={tokenOptions}
					placeholder="token: spacing.*"
				/>
			</div>
		</div>
	);
}