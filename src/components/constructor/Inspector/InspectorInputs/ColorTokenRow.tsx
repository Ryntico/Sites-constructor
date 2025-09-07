import { TokenSelect } from './TokenSelect.tsx';

export function ColorTokenRow({
								  label,
								  value,
								  onText,
								  tokenValue,
								  onTokenChange,
								  options,
							  }: {
	label: string;
	value: string;
	onText: (v: string) => void;
	tokenValue: string;
	onTokenChange: (tok: string) => void;
	options: [string, string][];
}) {
	const isTok = tokenValue !== '';

	return (
		<div>
			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>{label}</div>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
				<input
					type="color"
					value={isTok ? '' : value}
					onChange={(e) => onText(e.target.value)}
					disabled={isTok}
					style={{
						width: '100%',
						height: '32px',
						border: '1px solid #d0d3dc',
						borderRadius: 8,
					}}
				/>
				<TokenSelect
					value={tokenValue}
					onChange={(tok) => onTokenChange(tok === '__none__' ? '' : tok)}
					options={options}
					placeholder="token: colors.*"
				/>
			</div>
		</div>
	);
}