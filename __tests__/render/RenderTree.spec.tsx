/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen } from '@testing-library/react';
import { RenderTree } from '@/components/constructor/render/Renderer';
import { exportPageToHtml } from '@/components/constructor/render/exportHtml';
import type { PageSchema } from '@/types/siteTypes';
import { makeTheme } from '../../test/utils';

const theme = makeTheme();

function makePreviewSchema(): PageSchema {
	return {
		rootId: 'page',
		nodes: {
			page: {
				id: 'page',
				type: 'page',
				props: { style: { base: {} } },
				childrenOrder: ['h', 'p', 'rt', 'btn', 'inp', 'form1'],
			},
			h: { id: 'h', type: 'heading', props: { level: 2, text: 'Заголовок' } },
			p: { id: 'p', type: 'paragraph', props: { text: 'Абзац' } },
			rt: { id: 'rt', type: 'richtext', props: { text: '<strong>HTML</strong>' } },
			btn: {
				id: 'btn',
				type: 'button',
				props: {
					text: 'Кнопка',
					href: '#go',
					style: { base: {} },
					on: { click: [{ type: 'openUrl', url: '#' }] },
				},
			},
			inp: {
				id: 'inp',
				type: 'input',
				props: { name: 'email', required: true, inputmode: 'email' },
			},
			form1: {
				id: 'form1',
				type: 'form',
				props: { formId: 'f1', formAction: '/send', formMethod: 'post' },
				childrenOrder: [],
			},
		},
	};
}

describe('RenderTree / exportPageToHtml', () => {
	test('рендерит заголовок и параграф', () => {
		const schema = makePreviewSchema();
		render(<RenderTree schema={schema} theme={theme} />);
		expect(screen.getByText('Заголовок')).toBeInTheDocument();
		expect(screen.getByText('Абзац')).toBeInTheDocument();
	});

	test('richtext с HTML монтируется как HTML (strong)', () => {
		const schema = makePreviewSchema();
		render(<RenderTree schema={schema} theme={theme} />);
		const rt = screen.getByText('HTML');
		expect(rt.tagName.toLowerCase()).toBe('strong');
	});

	test('кнопка с href рендерится как <a>', () => {
		const schema = makePreviewSchema();
		render(<RenderTree schema={schema} theme={theme} />);
		const link = screen.getByText('Кнопка').closest('a')!;
		expect(link).toHaveAttribute('href', '#go');
		expect(link.dataset.actions).toBeDefined();
	});

	test('input получает boolean required и корректный inputmode', () => {
		const schema = makePreviewSchema();
		render(<RenderTree schema={schema} theme={theme} />);
		const input = document.querySelector('input[name="email"]')!;
		expect(input).toBeRequired();
		expect(input.getAttribute('inputmode')).toBe('email');
	});

	test('exportPageToHtml: генерит валидный HTML', () => {
		const schema = makePreviewSchema();
		const html = exportPageToHtml({ title: 'Тест', schema, theme });
		expect(html).toMatch(/^<!doctype html>/i);
		expect(html).toContain('<style>');
		expect(html).toContain('data-res-id="page"');
		expect(html).toContain('<title>Тест</title>');
	});
});
