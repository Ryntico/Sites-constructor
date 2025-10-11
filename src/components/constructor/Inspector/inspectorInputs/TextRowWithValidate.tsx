import { useState } from 'react';

const inputStyle: React.CSSProperties = {
	width: '100%',
	border: '1px solid #d0d3dc',
	borderRadius: 8,
	padding: '6px 8px',
	marginBottom: 10,
	fontSize: 13,
};

export function TextRowWithValidate({
										label,
										value,
										onChange,
										placeholder,
										error,
										validate,
										helperText,
										title,
										required,
									}: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	error?: string;
	validate?: (value: string) => string | undefined;
	helperText?: string;
	title?: string;
	required?: boolean;
}) {
	const [localError, setLocalError] = useState<string | undefined>();
	const [isDirty, setIsDirty] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		onChange(newValue);
		if (!isDirty) setIsDirty(true);
		if (validate) {
			setLocalError(validate(newValue));
		}
	};

	const handleBlur = () => {
		if (!isDirty) setIsDirty(true);
		if (validate) {
			setLocalError(validate(value));
		}
	};

	const displayError = isDirty && (error || localError);

	return (
		<label style={{ display: 'grid', gap: 4, fontSize: 12, position: 'relative' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#687087' }}>
          {label}
			{required && (
				<span style={{ color: '#ff4d4f', marginLeft: 4, fontWeight: 1000 }}>
              *
            </span>
			)}
        </span>
			</div>
			<input
				style={{
					...inputStyle,
					marginBottom: 0,
					border: displayError ? '1px solid rgb(255, 77, 79)' : inputStyle.border,
					padding: '8px 12px',
				}}
				value={value}
				onChange={handleChange}
				onBlur={handleBlur}
				placeholder={placeholder}
				{...(required && { required })}
				title={title}
			/>
			{displayError ? (
				<div style={{ color: '#ff4d4f', fontSize: 11, marginTop: 2, lineHeight: 1.2 }}>
					{displayError}
				</div>
			) : (
				helperText && (
					<div style={{ color: '#687087', fontSize: 11, marginTop: 2, lineHeight: 1.2, fontStyle: 'italic' }}>
						{helperText}
					</div>
				)
			)}
		</label>
	);
}