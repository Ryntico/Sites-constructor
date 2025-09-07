import { TokenSelect } from './TokenSelect.tsx';

export function TokenOnlyRow({
								 label,
								 currentValue,
								 onTokenChange,
								 options,
								 allowManualNumber,
								 manualValue,
								 onManualChange,
							 }: {
	label: string;
	currentValue: string;
	onTokenChange: (tok: string) => void;
	options: [string, string][];
	allowManualNumber?: boolean;
	manualValue?: string;
	onManualChange?: (v: string) => void;
}) {
	return (
		<div>
			<div style={{ fontSize: 12, margin: '6px 0 4px', color: '#687087' }}>{label}</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: allowManualNumber ? '1fr 1fr' : '1fr',
					gap: 6,
				}}
			>
				{allowManualNumber && (
					<input
						type="number"
						style={{
							width: '100%',
							border: '1px solid #d0d3dc',
							borderRadius: 8,
							padding: '6px 8px',
							fontSize: 13,
						}}
						value={manualValue ?? ''}
						onChange={(e) => onManualChange?.(e.target.value)}
						placeholder="число(px)"
					/>
				)}
				<TokenSelect
					value={currentValue}
					onChange={(tok) => onTokenChange(tok === '__none__' ? '' : tok)}
					options={options}
					placeholder={`token: ${label}.*`}
				/>
			</div>
		</div>
	);
}