import { useEffect, useState, useCallback } from 'react';
import { TextInput, Text } from '@mantine/core';
import { useAppDispatch } from '@/store/hooks';
import { updateSiteName } from '@/store/slices/siteSlice';
import { useDebounce } from '@/hooks/useDebounce';

interface SiteNameEditorProps {
	siteId: string;
	initialName: string;
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	variant?: 'default' | 'unstyled' | 'filled';
	className?: string;
}

const CursorText = ({ style }: { style?: React.CSSProperties }) =>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="28"
		height="28"
		viewBox="0 0 24 24"
		fill="none"
		stroke="#73bffa"
		strokeWidth="1"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={style}
	>
		<path d="M10 12h4" />
		<path d="M9 4a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3" />
		<path d="M15 4a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3" />
	</svg>;


export function SiteNameEditor({
								   siteId,
								   initialName,
								   size = 'md',
								   variant = 'unstyled',
								   className = '',
							   }: SiteNameEditorProps) {
	const dispatch = useAppDispatch();
	const [name, setName] = useState(initialName);
	const [isEditing, setIsEditing] = useState(false);

	useEffect(() => {
		setName(initialName);
	}, [initialName]);

	const { debounced: debouncedUpdate } = useDebounce((newName: string) => {
		if (newName.trim() && newName !== initialName) {
			dispatch(updateSiteName({ siteId, name: newName.trim() }));
		}
	}, 1000);

	const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const newName = e.target.value;
		setName(newName);
		debouncedUpdate(newName);
	}, [debouncedUpdate]);

	const handleBlur = useCallback(() => {
		setIsEditing(false);
		if (name.trim() && name !== initialName) {
			dispatch(updateSiteName({ siteId, name: name.trim() }));
		} else if (!name.trim()) {
			setName(initialName);
		}
	}, [dispatch, name, siteId, initialName]);

	const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			(e.currentTarget as HTMLInputElement).blur();
		} else if (e.key === 'Escape') {
			setName(initialName);
			setIsEditing(false);
		}
	}, [initialName]);

	if (isEditing) {
		return (
			<TextInput
				value={name}
				onChange={handleNameChange}
				onBlur={handleBlur}
				onKeyDown={handleKeyDown}
				autoFocus
				variant={variant}
				className={className}
				styles={{
					input: {
						fontWeight: 400,
						fontSize: '1.2rem',
						lineHeight: '1.5rem',
						textAlign: 'left',
						padding: '0 4px',
						minWidth: '100px',
						borderColor: '#228ae5',
						boxShadow: `0 0 0 1px #228ae5`,

					},
				}}
			/>
		);
	}

	return (
		<Text
			fw={700}
			size={size}
			className={`cursor-text hover:bg-gray-100 dark:hover:bg-gray-800 px-1 rounded ${className}`}
			onClick={() => setIsEditing(true)}
			style={{
				minHeight: variant === 'unstyled' ? '1.5rem' : undefined,
				lineHeight: variant === 'unstyled' ? '1.5rem' : undefined,
			}}
		>
			{name} <CursorText style={{ verticalAlign: 'middle' }} />
		</Text>

	);
}
