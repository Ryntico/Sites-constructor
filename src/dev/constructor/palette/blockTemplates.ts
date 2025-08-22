import type { BlockTemplateDoc } from '@/types/siteTypes.ts';

const h1: BlockTemplateDoc = {
	key: 'heading_h1',
	name: 'Heading (H1)',
	schema: {
		rootId: 'h1_root',
		nodes: {
			h1_root: {
				id: 'h1_root',
				type: 'heading',
				props: {
					level: 1,
					text: 'Заголовок страницы',
					style: { base: { mb: 12 } },
				},
			},
		},
	},
};

const paragraph: BlockTemplateDoc = {
	key: 'paragraph',
	name: 'Paragraph',
	schema: {
		rootId: 'p_root',
		nodes: {
			p_root: {
				id: 'p_root',
				type: 'paragraph',
				props: {
					text: 'Короткий абзац текста. Можно перетаскивать, удалять, перемещать.',
					style: { base: { mb: 12, color: 'token:colors.text.muted' } },
				},
			},
		},
	},
};

const buttonPrimary: BlockTemplateDoc = {
	key: 'button_primary',
	name: 'Button (Primary)',
	schema: {
		rootId: 'btn_root',
		nodes: {
			btn_root: {
				id: 'btn_root',
				type: 'button',
				props: {
					text: 'Действие',
					href: '#',
					style: {
						base: {
							bg: 'token:colors.primary.500',
							color: 'token:colors.text.onPrimary',
							px: 16,
							py: 12,
							radius: 'token:radius.md',
							shadow: 'token:shadow.sm',
							alignSelf: 'start',
						},
					},
				},
			},
		},
	},
};

const imageCard: BlockTemplateDoc = {
	key: 'image_card',
	name: 'Image',
	schema: {
		rootId: 'img_root',
		nodes: {
			img_root: {
				id: 'img_root',
				type: 'image',
				props: {
					src: 'https://picsum.photos/960/540',
					alt: 'Demo image',
					style: { base: { w: '100%', radius: 'token:radius.md', mb: 12 } },
				},
			},
		},
	},
};

const section: BlockTemplateDoc = {
	key: 'section',
	name: 'Section',
	schema: {
		rootId: 'sec_root',
		nodes: {
			sec_root: {
				id: 'sec_root',
				type: 'section',
				props: {
					style: {
						base: {
							py: 'token:spacing.32',
							px: 'token:spacing.16',
							bg: 'token:colors.surface',
						},
					},
				},
				childrenOrder: [],
			},
		},
	},
};

const boxCard: BlockTemplateDoc = {
	key: 'box_card',
	name: 'Box (Card)',
	schema: {
		rootId: 'bx_root',
		nodes: {
			bx_root: {
				id: 'bx_root',
				type: 'box',
				props: {
					style: {
						base: {
							display: 'flex',
							p: 16,
							bg: '#fff',
							radius: 'token:radius.md',
							shadow: 'token:shadow.sm',
							borderColor: 'token:colors.border',
						},
					},
				},
				childrenOrder: [],
			},
		},
	},
};

const row2: BlockTemplateDoc = {
	key: 'row2',
	name: 'Row (2 cols)',
	schema: {
		rootId: 'row_root',
		nodes: {
			row_root: {
				id: 'row_root',
				type: 'row',
				props: {
					style: {
						base: { display: 'flex', gap: 16 },
						sm: { display: 'block' },
					},
				},
				childrenOrder: [],
			},
		},
	},
};

const form: BlockTemplateDoc = {
	key: 'form',
	name: 'Форма',
	schema: {
		rootId: 'form_root',
		nodes: {
			form_root: {
				id: 'form_root',
				type: 'form',
				props: {
					formAction: '',
					formMethod: 'post',
					enctype: 'application/x-www-form-urlencoded',
					style: {
						base: {
							display: 'flex',
							flexDirection: 'column',
							gap: 12,
							p: 16,
							bg: 'token:colors.surface',
						},
					},
				},
				childrenOrder: [],
			},
		},
	},
};

const richtext: BlockTemplateDoc = {
	key: 'richtext',
	name: 'Rich Text',
	schema: {
		rootId: 'rt_root',
		nodes: {
			rt_root: {
				id: 'rt_root',
				type: 'richtext',
				props: {
					text: '<p>Отформатируйте текст с помощью списка, цитаты или обычного абзаца.</p>',
					style: { base: { mb: 12 } },
				},
			},
		},
	},
};

const quote: BlockTemplateDoc = {
	key: 'blockquote',
	name: 'Quote',
	schema: {
		rootId: 'quote_root',
		nodes: {
			quote_root: {
				id: 'quote_root',
				type: 'blockquote',
				props: {
					text: 'Цитата. Перетащите, чтобы добавить на страницу.',
					preAuthor: 'великий ',
					cite: 'источник',
					style: {
						base: {
							mb: 12,
							color: 'token:colors.text.muted',
							borderColor: 'token:colors.primary.500',
						},
					},
				},
			},
		},
	},
};

export const BLOCK_TEMPLATES: BlockTemplateDoc[] = [
	h1,
	richtext,
	quote,
	paragraph,
	buttonPrimary,
	imageCard,
	section,
	boxCard,
	row2,
	form,
];
