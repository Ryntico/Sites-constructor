import type { PageSchema } from '../runtime/types';

type PageMock = {
	route: string;
	title: string;
	schema: PageSchema;
};

export const pageMock: PageMock = {
	route: '/',
	title: 'Smoke — Custom Renderer',
	schema: {
		rootId: 'page',
		nodes: {
			page: {
				id: 'page',
				type: 'page',
				props: { style: { base: {} } },
				childrenOrder: ['heroSection', 'listSection'],
			},

			heroSection: {
				id: 'heroSection',
				type: 'section',
				props: {
					style: {
						base: {
							py: 'token:spacing.48',
							px: 'token:spacing.16',
							bg: 'token:colors.surface',
						},
					},
				},
				childrenOrder: ['heroBox'],
			},

			heroBox: {
				id: 'heroBox',
				type: 'box',
				props: {
					style: {
						base: {
							display: 'grid',
							columns: 1,
							gap: 24,
							maxW: 960,
							mx: 'auto',
							w: '100%',
						},
						sm: { display: 'block' },
					},
				},
				childrenOrder: ['heroLeft', 'heroRight'],
			},

			heroLeft: {
				id: 'heroLeft',
				type: 'box',
				props: { style: { base: {} } },
				childrenOrder: ['h1', 'p1', 'ctaBtn', 'cta2'],
			},

			h1: {
				id: 'h1',
				type: 'heading',
				props: {
					level: 1,
					text: 'Конструктор (smoke): кастомные узлы',
					style: { base: { mb: 12 } },
				},
			},

			p1: {
				id: 'p1',
				type: 'paragraph',
				props: {
					text: 'Страница отрендерена из JSON. Экспорт — в однофайловый HTML.',
					style: { base: { color: 'token:colors.text.muted', mb: 16 } },
				},
			},

			ctaBtn: {
				id: 'ctaBtn',
				type: 'button',
				props: {
					text: 'Открыть Github',
					href: 'https://github.com/',
					style: {
						base: {
							bg: 'token:colors.primary.500',
							color: 'token:colors.text.onPrimary',
							px: 16,
							py: 12,
							radius: 'token:radius.md',
							shadow: 'token:shadow.sm',
							mr: 12,
						},
					},
					on: {
						click: [
							{ type: 'toast', variant: 'info', message: 'Переходим…' },
						],
					},
				},
			},

			cta2: {
				id: 'cta2',
				type: 'button',
				props: {
					text: 'Действие',
					href: '#',
					style: {
						base: {
							bg: 'token:colors.primary.600',
							color: 'token:colors.text.onPrimary',
							px: 16,
							py: 12,
							radius: 'token:radius.md',
							shadow: 'token:shadow.sm',
						},
					},
				},
			},

			heroRight: {
				id: 'heroRight',
				type: 'image',
				props: {
					src: 'https://picsum.photos/seed/smoke/960/540',
					alt: 'demo',
					style: {
						base: { radius: 'token:radius.xl', shadow: 'token:shadow.md' },
					},
				},
			},

			listSection: {
				id: 'listSection',
				type: 'section',
				props: {
					style: { base: { py: 'token:spacing.32', px: 'token:spacing.16' } },
				},
				childrenOrder: ['listBox'],
			},

			listBox: {
				id: 'listBox',
				type: 'box',
				props: {
					style: {
						base: {
							maxW: 720,
							mx: 'auto',
							bg: 'token:colors.surface',
							p: 16,
							radius: 'token:radius.md',
							shadow: 'token:shadow.sm',
						},
					},
				},
				childrenOrder: ['h2', 'ul'],
			},

			h2: {
				id: 'h2',
				type: 'heading',
				props: {
					level: 2,
					text: 'Список возможностей',
					style: { base: { mb: 12 } },
				},
			},

			ul: {
				id: 'ul',
				type: 'list',
				props: { variant: 'ul', style: { base: { pl: 20 } } },
				childrenOrder: ['li1', 'li2', 'li3'],
			},

			li1: {
				id: 'li1',
				type: 'listItem',
				props: { text: 'Кастомные узлы + StyleShortcuts' },
			},
			li2: {
				id: 'li2',
				type: 'listItem',
				props: { text: 'Поддержка token:* из темы' },
			},
			li3: {
				id: 'li3',
				type: 'listItem',
				props: { text: 'Экспорт статичного HTML + мини-JS для экшенов' },
			},
		},
	},
};
