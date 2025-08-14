import type { ThemeTokens } from '@/types/siteTypes';

export const DEFAULT_THEME: ThemeTokens = {
	breakpoints: { sm: 640, md: 768, lg: 1024 },
	colors: {
		page: '#f5f7fb',
		surface: '#ffffff',
		border: '#e6e8ef',
		text: { base: '#111827', muted: '#6b7280', onPrimary: '#ffffff' },
		primary: { 500: '#6366F1', 600: '#4F46E5', outline: '#C7D2FE' },
	},
	spacing: {
		'4': 4,
		'6': 6,
		'8': 8,
		'10': 10,
		'12': 12,
		'16': 16,
		'20': 20,
		'24': 24,
		'28': 28,
		'32': 32,
		'36': 36,
		'40': 40,
		'48': 48,
		'56': 56,
		'64': 64,
	},
	radius: { sm: 6, md: 10, lg: 14, xl: 18 },
	shadow: {
		sm: '0 1px 2px rgba(0,0,0,.06)',
		md: '0 2px 6px rgba(0,0,0,.08)',
		lg: '0 10px 20px rgba(0,0,0,.10)',
	},
	typography: {
		fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
		sizes: { sm: 12, base: 14, md: 16, lg: 20, xl: 28 },
		lineHeights: { sm: 1.2, base: 1.4, md: 1.6, lg: 1.6, xl: 1.2 },
	},
};
