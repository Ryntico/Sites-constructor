import { useContext } from 'react';
import { ThemeEditorContext } from './ThemeEditorContext.tsx';

export function useThemeEditorContext() {
	const context = useContext(ThemeEditorContext);
	if (!context) {
		throw new Error('useThemeEditorContext must be used within ThemeEditorProvider');
	}
	return context;
}