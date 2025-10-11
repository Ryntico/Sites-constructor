const inputStyle: React.CSSProperties = {
	width: '100%',
	border: '1px solid #d0d3dc',
	borderRadius: 8,
	padding: '6px 8px',
	marginBottom: 10,
	fontSize: 13,
};

export function NumberRow({
							  label,
							  value,
							  onChange,
							  disabled,
							  title,
						  }: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	disabled?: boolean;
	title?: string;
}) {
	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12 }}>
			<span style={{ color: '#687087' }}>{label}</span>
			<input
				type="number"
				style={{ ...inputStyle, marginBottom: 0 }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				title={title}
			/>
		</label>
	);
}