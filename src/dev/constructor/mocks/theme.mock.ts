import type { ThemeTokens } from '@/types/siteTypes.ts';

export const themeMock: ThemeTokens = {
	breakpoints: { sm: 640, md: 960, lg: 1200 },
	colors: {
		page: '#f6f7fb',
		surface: '#ffffff',
		border: '#e6e8ef',
		text: { base: '#1f2937', muted: '#6b7280', onPrimary: '#ffffff' },
		primary: { 500: '#3b82f6', 600: '#2563eb', outline: 'rgba(59,130,246,.3)' },
	},
	spacing: {
		'0': 0,
		'8': 8,
		'12': 12,
		'16': 16,
		'20': 20,
		'24': 24,
		'32': 32,
		'40': 40,
		'48': 48,
		'64': 64,
	},
	radius: { sm: 8, md: 12, xl: 20, pill: 9999 },
	shadow: { sm: '0 6px 20px rgba(0,0,0,.06)', md: '0 10px 30px rgba(0,0,0,.10)' },
	typography: {
		fontFamily:
			'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
		sizes: { h1: 42, h2: 32, p: 16 },
		lineHeights: { h1: 1.2, h2: 1.25, p: 1.6 },
	},
	components: {
		blockquote: {
			bg: 'rgba(99, 102, 241, 0.05)',
			borderColor: '#3b82f6',
			borderLeft: '4px solid rgb(59, 130, 246)',
			p: '16px 20px',
			radius: 8,
		},
	},

};
