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
	components?: {
		[component: string]: StyleShortcuts;
	};
};

export type StyleShortcuts = {
	flexDirection?: string;
	display?: string;
	wrap?: string;
	columns?: number;
	gap?: number | string;
	alignSelf?: string;
	order?: number;
	flexGrow?: number | string;
	flexShrink?: number | string;
	w?: number | string;
	h?: number | string;
	maxW?: number | string;
	maxH?: number | string;
	minW?: number | string;
	minH?: number | string;
	p?: number | string;
	px?: number | string;
	py?: number | string;
	pt?: number;
	pr?: number;
	pb?: number;
	pl?: number;
	m?: number | string;
	mx?: number | string;
	my?: number;
	mt?: number;
	mr?: number;
	mb?: number;
	ml?: number;
	bg?: string;
	opacity?: number | string;
	color?: string;
	borderColor?: string;
	radius?: string | number;
	borderLeftWidth?: number | string;
	borderLeft?: string;
	borderStyle?: string;
	shadow?: string;
	textAlign?: string;
	items?: string;
	justify?: string;
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

export type ElementType =
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
	| 'listItem'
	| 'form'
	| 'input'
	| 'textarea'
	| 'select'
	| 'richtext'
	| 'blockquote'
	| 'anchor';

export type NodeJson = {
	id: string;
	type: ElementType;
	props?: {
		label?: string;
		formId?: string;
		formAction?: string;
		formMethod?: string;
		enctype?: string;
		text?: string;
		level?: number;
		href?: string;
		src?: string;
		alt?: string;
		type?: string;
		name?: string;
		value?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		multiple?: boolean;
		min?: number;
		max?: number;
		step?: number;
		minlength?: number;
		maxlength?: number;
		pattern?: string;
		title?: string;
		size?: number;
		rows?: number;
		cols?: number;
		autocomplete?: string;
		autofocus?: boolean;
		inputmode?: string;
		spellcheck?: boolean;
		dir?: string;
		wrap?: string;
		style?: {
			base?: StyleShortcuts;
			sm?: StyleShortcuts;
			md?: StyleShortcuts;
			lg?: StyleShortcuts;
		};
		on?: Record<string, Action[]>;
		variant?: 'ul' | 'ol';
		preAuthor?: string;
		cite?: string;
		options?: Array<{ value: string; text: string }>;
	};
	childrenOrder?: string[];
};

export type PageSchema = { rootId: string; nodes: Record<string, NodeJson> };
export type NodeSubtree = {
	rootId: string;
	nodes: Record<string, NodeJson>;
};

export type BlockTemplateDoc = {
	id: string;
	name: string;
	schema: NodeSubtree;
	tags?: string[];
	previewImage?: string | null;
};

export type PageTemplateDoc = {
	id: string;
	name: string;
	title: string;
	route: string;
	schema: PageSchema;
};

export type PageDoc = {
	id: string;
	route: string;
	title: string;
	schema: PageSchema;
	draftVersion: number;
	updatedAt?: unknown;
	updatedBy?: string;
};

export type SiteDoc = {
	id: string;
	ownerId: string;
	name: string;
	theme: ThemeTokens;
	published?: { version?: number; url?: string; at?: unknown };
	createAt?: number | null;
	updateAt?: number | null;
};

export type SchemaPatch = {
	set: Record<string, unknown>;
	del: string[];
};

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Axis = 'x' | 'y';
