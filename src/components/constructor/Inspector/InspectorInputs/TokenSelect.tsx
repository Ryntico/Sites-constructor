const inputStyle: React.CSSProperties = {
	width: '100%',
	border: '1px solid #d0d3dc',
	borderRadius: 8,
	padding: '6px 8px',
	marginBottom: 10,
	fontSize: 13,
};

export function TokenSelect({
								value,
								onChange,
								options,
								placeholder,
							}: {
	value: string;
	onChange: (tok: string) => void;
	options: [string, string][];
	placeholder?: string;
}) {
	return (
		<select
			style={{ ...inputStyle, marginBottom: 0 }}
			value={value}
			onChange={(e) => onChange(e.target.value)}
		>
			<option value="">{placeholder ?? '—'}</option>
			{options.map(([key, label]) => (
				<option key={key} value={key}>
					token:{key} {` (${label})`}
				</option>
			))}
			<option value="__none__">Очистить</option>
		</select>
	);
}