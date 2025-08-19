export type ThemeTokens = {
	breakpoints: { sm: number; md: number; lg: number };
	colors: {
		page: string;
		surface: string;
		border: string;
		text: { base: string; muted: string; onPrimary: string };
		primary: { 500: string; 600: string; outline: string };
	};
	spacing: Record<string, number>;
	radius: Record<string, number>;
	shadow: Record<string, string>;
	typography?: {
		fontFamily?: string;
		sizes?: Record<string, number>;
		lineHeights?: Record<string, number>;
	};
};

export type StyleShortcuts = {
	flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse' | undefined;
	display?: 'block' | 'flex' | 'grid';
	columns?: number;
	gap?: number;
	w?: number | string;
	h?: number | string;
	maxW?: number | string;
	p?: number;
	px?: number | string;
	py?: number | string;
	pt?: number;
	pr?: number;
	pb?: number;
	pl?: number;
	m?: number;
	mx?: number | string;
	my?: number;
	mt?: number;
	mr?: number;
	mb?: number;
	ml?: number | string;
	bg?: string;
	color?: string;
	borderColor?: string;
	radius?: string | number;
	shadow?: string;
	textAlign?: 'left' | 'center' | 'right';
	items?: 'start' | 'center' | 'end';
	justify?: 'start' | 'center' | 'end' | 'between';
};

export type Action =
	| { type: 'openUrl'; url: string; target?: 'self' | 'blank' }
	| {
			type: 'scrollTo';
			selector: string;
			behavior?: 'auto' | 'smooth';
			offset?: number;
	  }
	| { type: 'toast'; variant: 'success' | 'error' | 'info'; message: string };

export type NodeJson = {
	id: string;
	type:
		| 'page'
		| 'section'
		| 'box'
		| 'row'
		| 'heading'
		| 'paragraph'
		| 'image'
		| 'button'
		| 'divider'
		| 'list'
		| 'listItem';
	props?: {
		text?: string;
		level?: 1 | 2 | 3 | 4 | 5 | 6;
		href?: string;
		src?: string;
		alt?: string;
		style?: {
			base?: StyleShortcuts;
			sm?: StyleShortcuts;
			md?: StyleShortcuts;
			lg?: StyleShortcuts;
		};
		on?: Record<'click', Action[]>;
		variant?: 'ul' | 'ol';
	};
	childrenOrder?: string[];
};

export type PageSchema = {
	rootId: string;
	nodes: Record<string, NodeJson>;
};

export type NodeSubtree = {
	rootId: string;
	nodes: Record<string, NodeJson>;
};

export type BlockTemplateDoc = {
	key: string;
	name: string;
	schema: NodeSubtree;
	previewImage?: string;
};
