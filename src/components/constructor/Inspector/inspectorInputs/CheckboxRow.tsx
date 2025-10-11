import { Checkbox } from '@mantine/core';

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
		<Checkbox
			label={label}
			checked={checked}
			onChange={(event) => onChange(event.currentTarget.checked)}
			title={title}
			size="sm"
			styles={{
				label: {
					fontSize: 14,
					color: '#4a4a4a',
					cursor: 'pointer',
				},
				body: {
					alignItems: 'center',
				},
			}}
		/>
	);
}