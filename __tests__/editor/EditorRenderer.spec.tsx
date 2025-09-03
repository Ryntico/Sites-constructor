/* eslint-disable @typescript-eslint/no-unused-vars */
import { render } from '@testing-library/react';
import {
	makeTheme,
	makeSchemaEmptyContainer,
	makeSchemaWithChild,
	DTMock,
	tplH1,
} from '../../test/utils';

import {
	TYPE_MOVE,
	TYPE_TPL,
	TYPE_COPY_INTENT,
} from '@/dev/constructor/runtime/dnd/constants';

import { EditorRenderer } from '@/dev/constructor/editor/EditorRenderer';
import { NodeView } from '@/dev/constructor/editor/NodeView';
import type { NodeViewProps } from '@/dev/constructor/editor/NodeView';
import type { NodeSubtree, Side } from '@/types/siteTypes';

function dispatchDrag(
	el: Element,
	type: 'dragenter' | 'dragleave' | 'drop',
	dt: DataTransfer,
	extras: Partial<DragEventInit & { relatedTarget?: EventTarget }> = {},
) {
	const ev = new DragEvent(type, { bubbles: true, cancelable: true });
	Object.defineProperty(ev, 'dataTransfer', { value: dt });
	if (extras.relatedTarget) {
		Object.defineProperty(ev, 'relatedTarget', { value: extras.relatedTarget });
	}
	el.dispatchEvent(ev);
}

describe('EditorRenderer / NodeView', () => {
	const theme = makeTheme();

	const onSchemaChange = jest.fn();
	const resolveTemplate = (key: string): NodeSubtree | null =>
		key === 'tplH1' ? tplH1() : null;

	const noopDelete: NodeViewProps['onDelete'] = jest.fn();
	const noopDup: NodeViewProps['onDuplicate'] = jest.fn();
	const noopSelect: NonNullable<NodeViewProps['onSelect']> = jest.fn();
	const noopDropAtSide: NodeViewProps['handleDropAtSide'] = jest.fn(
		(
			_refId: string,
			_side: Side,
			_tplKey?: string,
			_movingId?: string,
			_opts?: { copy?: boolean },
		) => {},
	);
	const noopDropInside: NodeViewProps['handleDropInside'] = jest.fn(
		(
			_parentId: string,
			_tplKey?: string,
			_movingId?: string,
			_opts?: { copy?: boolean },
		) => {},
	);

	beforeEach(() => {
		onSchemaChange.mockReset();
		(noopDelete as jest.Mock).mockReset();
		(noopDup as jest.Mock).mockReset();
		(noopSelect as jest.Mock).mockReset();
		(noopDropAtSide as jest.Mock).mockReset();
		(noopDropInside as jest.Mock).mockReset();
	});

	test('EditorRenderer: не падает на dragenter/leave/drop (ручной DragEvent с dataTransfer)', () => {
		const schema = makeSchemaEmptyContainer();

		render(
			<EditorRenderer
				schema={schema}
				theme={theme}
				onSchemaChange={onSchemaChange}
				resolveTemplate={resolveTemplate}
			/>,
		);

		const root = document.querySelector('[data-editor-root]') as HTMLElement;
		const dt = new DTMock();
		dt.setData(TYPE_TPL, 'tplH1');

		dispatchDrag(root, 'dragenter', dt);
		dispatchDrag(root, 'dragleave', dt, { relatedTarget: document.body });
		dispatchDrag(root, 'drop', dt);
	});

	test('NodeView: drop шаблона в пустой контейнер вызывает handleDropInside', () => {
		const schema = makeSchemaEmptyContainer();
		const handleDropInside = jest.fn() as jest.MockedFunction<
			NodeViewProps['handleDropInside']
		>;

		render(
			<NodeView
				id="section1"
				schema={schema}
				theme={theme}
				onDelete={noopDelete}
				onDuplicate={noopDup}
				onSelect={noopSelect}
				isDragging={true}
				selectedId={null}
				handleDropAtSide={noopDropAtSide}
				handleDropInside={handleDropInside}
				isMac={true}
				copyKeyRef={{ current: false }}
			/>,
		);

		const outer = document.querySelector('[data-res-id="section1"]') as HTMLElement;
		const inner = outer.firstElementChild as HTMLElement;

		const dt = new DTMock();
		dt.setData(TYPE_TPL, 'tplH1');

		dispatchDrag(inner, 'drop', dt);

		expect(handleDropInside).toHaveBeenCalled();
		const last = handleDropInside.mock.calls.at(-1)!;
		expect(last[0]).toBe('section1');
		expect(last[1]).toBe('tplH1');
		expect(last[2]).toBeUndefined();
		expect(last[3]).toEqual(expect.any(Object));
	});

	test('NodeView: drop перемещаемого узла с copyKey=true -> copy=true', () => {
		const schema = makeSchemaEmptyContainer();
		const handleDropInside = jest.fn() as jest.MockedFunction<
			NodeViewProps['handleDropInside']
		>;

		render(
			<NodeView
				id="section1"
				schema={schema}
				theme={theme}
				onDelete={noopDelete}
				onDuplicate={noopDup}
				onSelect={noopSelect}
				isDragging={true}
				selectedId={null}
				handleDropAtSide={noopDropAtSide}
				handleDropInside={handleDropInside}
				isMac={true}
				copyKeyRef={{ current: true }}
			/>,
		);

		const outer = document.querySelector('[data-res-id="section1"]') as HTMLElement;
		const inner = outer.firstElementChild as HTMLElement;

		const dt = new DTMock();
		dt.setData(TYPE_MOVE, 'h1');
		dt.setData(TYPE_COPY_INTENT, '0');

		dispatchDrag(inner, 'drop', dt);

		expect(handleDropInside).toHaveBeenCalledWith('section1', undefined, 'h1', {
			copy: true,
		});
	});

	test('NodeView: dragStart учитывает предустановленный dataset.copyIntent', () => {
		const schema = makeSchemaWithChild();

		render(
			<NodeView
				id="h1"
				schema={schema}
				theme={theme}
				onDelete={noopDelete}
				onDuplicate={noopDup}
				onSelect={noopSelect}
				isDragging={false}
				selectedId={null}
				handleDropAtSide={noopDropAtSide}
				handleDropInside={noopDropInside}
				isMac={true}
				copyKeyRef={{ current: false }}
			/>,
		);

		const node = document.querySelector('[data-res-id="h1"]') as HTMLElement;
		const dt = new DTMock();

		node.dataset.copyIntent = '1';

		const ev = new DragEvent('dragstart', { bubbles: true, cancelable: true });
		Object.defineProperty(ev, 'dataTransfer', { value: dt });
		node.dispatchEvent(ev);

		expect(dt.getData(TYPE_COPY_INTENT)).toBe('1');
		expect(dt.getData(TYPE_MOVE)).toBe('h1');
	});

	test('NodeView: лейбл контейнера (section) отображается', () => {
		const schema = makeSchemaEmptyContainer();

		render(
			<NodeView
				id="section1"
				schema={schema}
				theme={theme}
				onDelete={noopDelete}
				onDuplicate={noopDup}
				onSelect={noopSelect}
				isDragging={false}
				selectedId={null}
				handleDropAtSide={noopDropAtSide}
				handleDropInside={noopDropInside}
				isMac={false}
				copyKeyRef={{ current: false }}
			/>,
		);

		const label = (
			document.querySelector('[data-res-id="section1"] span')?.textContent || ''
		).toLowerCase();
		expect(label).toContain('section');
	});
});
