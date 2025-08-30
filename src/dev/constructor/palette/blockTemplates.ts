import type { BlockTemplateDoc } from '@/types/siteTypes.ts';

const h1: BlockTemplateDoc = {
	id: 'heading_h1',
	name: 'Заголовок',
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
	id: 'paragraph',
	name: 'Параграф',
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
	id: 'button_primary',
	name: 'Кнопка',
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
	id: 'image_card',
	name: 'Изображение',
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
	id: 'section',
	name: 'Секция',
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
							bg: 'transparent',
						},
					},
				},
				childrenOrder: [],
			},
		},
	},
};

const boxCard: BlockTemplateDoc = {
	id: 'box_card',
	name: 'Контейнер',
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
							flexDirection: 'row',
							gap: 8,
							p: 16,
							bg: 'transparent',
							radius: '',
							shadow: '',
							borderColor: '',
						},
					},
				},
				childrenOrder: [],
			},
		},
	},
};

const row2: BlockTemplateDoc = {
	id: 'row2',
	name: 'Ряд',
	schema: {
		rootId: 'row_root',
		nodes: {
			row_root: {
				id: 'row_root',
				type: 'row',
				props: {
					style: {
						base: { display: 'flex', gap: 16, bg: 'transparent' },
						sm: { display: 'block' },
					},
				},
				childrenOrder: [],
			},
		},
	},
};

const form: BlockTemplateDoc = {
	id: 'form',
	name: 'Блок формы',
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
							bg: 'transparent',
						},
					},
				},
				childrenOrder: [],
			},
		},
	},
};

const input: BlockTemplateDoc = {
	id: 'input',
	name: 'Универсальное поле ввода формы',
	schema: {
		rootId: 'input_root',
		nodes: {
			input_root: {
				id: 'input_root',
				type: 'input',
				props: {
					type: 'text',
					name: '',
					placeholder: 'Enter text here...',
					style: {
						base: {},
					},
				},
			},
		},
	},
};

const textarea: BlockTemplateDoc = {
	id: 'textarea',
	name: 'Текстовая область формы',
	schema: {
		rootId: 'textarea_root',
		nodes: {
			textarea_root: {
				id: 'textarea_root',
				type: 'textarea',
				props: {
					name: '',
					placeholder: 'Enter text here... (textarea)',
					style: {
						base: {},
					},
				},
			},
		},
	},
};

const select: BlockTemplateDoc = {
	id: 'select',
	name: 'Выпадающий список формы',
	schema: {
		rootId: 'select_root',
		nodes: {
			select_root: {
				id: 'select_root',
				type: 'select',
				props: {
					name: '',
					style: {
						base: {},
					},
				},
			},
		},
	},
};

const richtext: BlockTemplateDoc = {
	id: 'richtext',
	name: 'Текстовый редактор',
	schema: {
		rootId: 'rt_root',
		nodes: {
			rt_root: {
				id: 'rt_root',
				type: 'richtext',
				props: {
					text: '<p>Отформатируйте текст с помощью списка, цитаты или обычного абзаца.</p>',
					style: { base: { mb: 12, bg: 'transparent' } },
				},
			},
		},
	},
};

const quote: BlockTemplateDoc = {
	id: 'blockquote',
	name: 'Цитата',
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
							color: 'token:components.blockquote.color',
							borderLeft: 'token:components.blockquote.borderLeft',
							bg: 'token:components.blockquote.bg',
							p: 'token:components.blockquote.p',
							radius: 'token:components.blockquote.radius',
						},
					},
				},
			},
		},
	},
};

const divider: BlockTemplateDoc = {
	id: 'divider',
	name: 'Разделитель',
	schema: {
		rootId: 'divider_root',
		nodes: {
			divider_root: {
				id: 'divider_root',
				type: 'divider',
				props: {
					style: {
						base: {
							display: 'block',
							my: 8,
							h: 2,
							w: '100%',
							bg: 'token:colors.border',
						},
					},
				},
			},
		},
	},
};

const anchor: BlockTemplateDoc = {
	id: 'anchor',
	name: 'Якорь',
	schema: {
		rootId: 'anchor_root',
		nodes: {
			anchor_root: {
				id: 'anchor_root',
				type: 'anchor',
				props: {
					style: {
						base: {
							h: '1px',
							minW: '100px',
							opacity: 0
						}
					},
				},
			},
			btn_root: {
				id: 'btn_root',
				type: 'button',
				props: {
					text: 'Ссылка на якорь',
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
	input,
	textarea,
	select,
	divider,
	anchor,
];
