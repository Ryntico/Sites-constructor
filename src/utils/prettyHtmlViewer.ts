const VOID = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr',
]);

function esc(s: string) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function trimText(t: string) {
	return t.replace(/\s+/g, ' ').trim();
}

export function prettifyHtml(html: string): string {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');

	const out: string[] = [];
	const TAB = '  ';

	function walk(node: Node, depth: number) {
		const pad = TAB.repeat(depth);
		switch (node.nodeType) {
			case Node.DOCUMENT_NODE: {
				const d = node as Document;
				out.push('<!doctype html>');
				if (d.documentElement) walk(d.documentElement, depth);
				return;
			}
			case Node.ELEMENT_NODE: {
				const el = node as Element;
				const tag = el.tagName.toLowerCase();

				const attrs = Array.from(el.attributes)
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((a) => (a.value ? `${a.name}="${a.value}"` : a.name))
					.join(' ');

				const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
				const openVoid = attrs ? `<${tag} ${attrs}` : `<${tag}`;

				if (VOID.has(tag)) {
					out.push(pad + openVoid + '>');
					return;
				}

				if (tag === 'style' || tag === 'script') {
					out.push(pad + open);
					const raw = (el.textContent ?? '').replace(/\r\n/g, '\n').trimEnd();
					if (raw)
						raw.split('\n').forEach((line) =>
							out.push(TAB.repeat(depth + 1) + line),
						);
					out.push(pad + `</${tag}>`);
					return;
				}

				const children = Array.from(el.childNodes);
				if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
					const t = trimText(children[0].textContent ?? '');
					out.push(
						pad +
							(t
								? `${open.slice(0, -1)}>${esc(t)}</${tag}>`
								: `${open}</${tag}>`),
					);
					return;
				}

				out.push(pad + open);
				children.forEach((ch) => walk(ch, depth + 1));
				out.push(pad + `</${tag}>`);
				return;
			}
			case Node.TEXT_NODE: {
				const t = trimText(node.textContent ?? '');
				if (t) out.push(TAB.repeat(depth) + esc(t));
				return;
			}
			case Node.COMMENT_NODE: {
				const c = (node as Comment).data.trim();
				out.push(TAB.repeat(depth) + `<!-- ${esc(c)} -->`);
				return;
			}
			default:
				return;
		}
	}

	walk(doc, 0);
	return out.join('\n');
}

export function highlightHtml(pretty: string): string {
	const escAll = pretty
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	let s = escAll.replace(
		/&lt;!--([\s\S]*?)--&gt;/g,
		(_m, body) =>
			`<span class="tok-o">&lt;!--</span><span class="tok-c">${body}</span><span class="tok-o">--&gt;</span>`,
	);

	s = s.replace(/&lt;([^!][^&]*)&gt;/g, (_m, inner: string) => {
		let str = inner.trim();
		const closing = str.startsWith('/');
		if (closing) str = str.slice(1).trim();

		const nameMatch = str.match(/^([a-zA-Z0-9:-]+)/);
		if (!nameMatch)
			return `<span class="tok-o">&lt;</span>${str}<span class="tok-o">&gt;</span>`;
		const tag = nameMatch[1];
		let rest = str.slice(tag.length);

		let selfClose = false;
		if (/\s*\/$/.test(rest)) {
			selfClose = true;
			rest = rest.replace(/\s*\/$/, '');
		}

		const parts: string[] = [];
		const attrRe = /\s+([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*"([^"]*)")?/g;
		let m: RegExpExecArray | null;
		while ((m = attrRe.exec(rest))) {
			const aname = m[1];
			const aval = m[2];
			if (aval === undefined) {
				parts.push(` <span class="tok-a">${aname}</span>`);
			} else {
				parts.push(
					` <span class="tok-a">${aname}</span><span class="tok-o">=</span><span class="tok-o">"</span><span class="tok-v">${aval}</span><span class="tok-o">"</span>`,
				);
			}
		}

		const openAngle = closing ? '&lt;/' : '&lt;';
		const closeSlash = selfClose ? `<span class="tok-o">/</span>` : '';
		return `<span class="tok-o">${openAngle}</span><span class="tok-n">${tag}</span>${parts.join('')}${closeSlash}<span class="tok-o">&gt;</span>`;
	});

	return s;
}

export function splitLines(highlighted: string): string[] {
	return highlighted.split('\n');
}
