export function CheckboxRow({
								label,
								checked,
								onChange,
								title,
							}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	title?: string;
}) {
	return (
		<label
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 4,
				fontSize: 14,
				color: '#4a4a4a',
				cursor: 'pointer',
			}}
		>
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				style={{ margin: 0 }}
				title={title}
			/>
			{label}
		</label>
	);
}