const inputStyle: React.CSSProperties = {
	width: '100%',
	border: '1px solid #d0d3dc',
	borderRadius: 8,
	padding: '6px 8px',
	marginBottom: 10,
	fontSize: 13,
};

export function TextRow({
							label,
							value,
							onChange,
							placeholder,
							title,
						}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	title?: string;
}) {
	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12, position: 'relative' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<span style={{ color: '#687087' }}>{label}</span>
				{title && <span style={{ fontSize: 12, color: '#687087' }}>{title}</span>}
			</div>
			<input
				style={{ ...inputStyle, marginBottom: 0 }}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
			/>
		</label>
	);
}