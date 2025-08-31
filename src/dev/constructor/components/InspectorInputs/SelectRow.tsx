const inputStyle: React.CSSProperties = {
	width: '100%',
	border: '1px solid #d0d3dc',
	borderRadius: 8,
	padding: '6px 8px',
	marginBottom: 10,
	fontSize: 13,
};

export function SelectRow({
							  label,
							  value,
							  onChange,
							  options,
							  disabled,
							  title,
						  }: {
	label: string;
	value: string | number;
	onChange: (v: string) => void;
	options: [string, string][];
	disabled?: boolean;
	title?: string;
}) {
	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
			<span style={{ color: '#687087' }}>{label}</span>
			<select
				style={{ ...inputStyle, marginBottom: 0 }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				title={title}
			>
				{options.map(([val, label]) => (
					<option key={val + label} value={val}>
						{label}
					</option>
				))}
			</select>
		</label>
	);
}