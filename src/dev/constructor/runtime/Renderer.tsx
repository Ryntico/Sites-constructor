import React from 'react';
import type { PageSchema, NodeJson, ThemeTokens, Action } from '@/types/siteTypes';
import { mergeResponsive, styleObjToCss } from './style';

function actionsAttr(on?: Record<string, Action[]>) {
	if (!on?.click?.length) return undefined;
	try {
		return JSON.stringify(on.click);
	} catch {
		return undefined;
	}
}

export function RenderTree(props: { schema: PageSchema; theme: ThemeTokens }) {
	const { schema, theme } = props;
	return <Node node={schema.nodes[schema.rootId]} schema={schema} theme={theme} />;
}

function Node({
	node,
	schema,
	theme,
}: {
	node: NodeJson;
	schema: PageSchema;
	theme: ThemeTokens;
}) {
	const kids = node.childrenOrder?.map((id) => schema.nodes[id]) ?? [];
	const { base, mediaCssText } = mergeResponsive(theme, node.props);
	const dataAttrs: any = { 'data-res-id': node.id };

	switch (node.type) {
		case 'page': {
			return (
				<div
					style={{ ...base, minHeight: '100vh', background: theme.colors.page }}
					{...dataAttrs}
				>
					{kids.map((k) => (
						<Node key={k.id} node={k} schema={schema} theme={theme} />
					))}
					{mediaCssText ? (
						<style dangerouslySetInnerHTML={{ __html: mediaCssText }} />
					) : null}
				</div>
			);
		}
		case 'section':
		case 'box':
		case 'row': {
			const Tag = node.type === 'section' ? 'section' : 'div';
			return (
				<Tag style={base as any} {...dataAttrs}>
					{kids.map((k) => (
						<Node key={k.id} node={k} schema={schema} theme={theme} />
					))}
				</Tag>
			);
		}
		case 'heading': {
			const level = node.props?.level ?? 1;
			const Tag = `h${level}` as any;
			return (
				<Tag style={base} {...dataAttrs}>
					{node.props?.text ?? ''}
				</Tag>
			);
		}
		case 'paragraph':
			return (
				<p style={base} {...dataAttrs}>
					{node.props?.text ?? ''}
				</p>
			);
		case 'richtext': {
			const html = node.props?.text ?? '';
			const hasHtml = /<[a-z][\s\S]*>/i.test(html);
			return hasHtml ? (
				<div style={base} {...dataAttrs} dangerouslySetInnerHTML={{ __html: html }} />
			) : (
				<p style={base} {...dataAttrs}>{html}</p>
			);
		}
		case 'image':
			return (
				<img
					style={base}
					src={node.props?.src}
					alt={node.props?.alt ?? ''}
					{...dataAttrs}
				/>
			);
		case 'button': {
			const href = node.props?.href;
			const text = node.props?.text ?? 'Button';
			const act = actionsAttr(node.props?.on);
			if (href) {
				return (
					<a
						href={href}
						style={
							{
								...base,
								textDecoration: 'none',
								display: 'inline-block',
							} as React.CSSProperties
						}
						data-actions={act}
						{...dataAttrs}
					>
						{text}
					</a>
				);
			}
			return (
				<button style={base as any} data-actions={act} {...dataAttrs}>
					{text}
				</button>
			);
		}
		case 'input': {
			return (
				<input
					type={node.props?.type || 'text'}
					name={node.props?.name}
					value={node.props?.value}
					placeholder={node.props?.placeholder}
					required={node.props?.required}
					disabled={node.props?.disabled}
					readOnly={node.props?.readonly}
					min={node.props?.min}
					max={node.props?.max}
					step={node.props?.step}
					minLength={node.props?.minlength}
					maxLength={node.props?.maxlength}
					pattern={node.props?.pattern}
					title={node.props?.title}
					size={node.props?.size}
					autoComplete={node.props?.autocomplete}
					autoFocus={node.props?.autofocus}
					style={base as React.CSSProperties}
					{...dataAttrs}
				/>
			);
		}
		case 'divider': {
			const css = {
				...base,
				height: (base as any).height ?? 1,
				width: (base as any).width ?? '100%',
			} as React.CSSProperties;
			return <div style={css} {...dataAttrs} />;
		}
		case 'list': {
			const Tag = (node.props?.variant === 'ol' ? 'ol' : 'ul') as any;
			return (
				<Tag style={base} {...dataAttrs}>
					{kids.map((k) => (
						<Node key={k.id} node={k} schema={schema} theme={theme} />
					))}
				</Tag>
			);
		}
		case 'listItem':
			return (
				<li style={base} {...dataAttrs}>
					{node.props?.text ?? ''}
				</li>
			);
		case 'form': {
			return (
				<form
					action={node.props?.formAction}
					method={node.props?.formMethod}
					encType={node.props?.enctype}
					style={{ ...base, display: 'flex', flexDirection: 'column', gap: 8 }}
					{...dataAttrs}
				>
					{kids.map((k) => (
						<Node key={k.id} node={k} schema={schema} theme={theme} />
					))}
				</form>
			);
		}

		case 'blockquote': {
			return (
				<blockquote style={base} {...dataAttrs}>
					{node.props?.text ?? ''}
					{(node.props?.preAuthor || node.props?.cite) && (
						<p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
							{node.props?.preAuthor}
							{node.props?.cite && (<cite>{node.props.cite}</cite>)}
						</p>
					)}
				</blockquote>
			);
		}
		default:
			return <div style={{ color: 'crimson' }}>Unknown node: {node.type}</div>;
	}
}

export function exportPageToHtml(opts: {
	title: string;
	schema: PageSchema;
	theme: ThemeTokens;
}) {
	const { title, schema, theme } = opts;
	const { html, css, js } = renderStaticHtml(schema, theme);

	const doc = [
		'<!doctype html>',
		`<html lang="ru">`,
		'<head>',
		`<meta charset="utf-8" />`,
		`<meta name="viewport" content="width=device-width, initial-scale=1" />`,
		`<title>${escapeHtml(title)}</title>`,
		`<style>${resetCss()}${baseCss(theme)}${css}</style>`,
		'</head>',
		'<body>',
		html,
		`<script>${runtimeJs()}</script>`,
		js ? `<script>${js}</script>` : '',
		'</body></html>',
	].join('');

	return doc;
}

function renderStaticHtml(schema: PageSchema, theme: ThemeTokens) {
	let css = '';
	const js = '';

	const walk = (node: NodeJson): string => {
		const kids = node.childrenOrder?.map((id) => schema.nodes[id]) ?? [];
		const { base, mediaCssText } = mergeResponsive(theme, node.props);
		if (mediaCssText) css += mediaCssText;

		const style = styleObjToCss(base);
		const data = ` data-res-id="${escapeAttr(node.id)}"`;

		switch (node.type) {
			case 'page':
				return `<div style="${style};min-height:100vh;background:${theme.colors.page};"${data}>${kids
					.map(walk)
					.join('')}</div>`;
			case 'section':
			case 'box':
			case 'row': {
				const tag = node.type === 'section' ? 'section' : 'div';
				return `<${tag} style="${style}"${data}>${kids.map(walk).join('')}</${tag}>`;
			}
			case 'heading': {
				const lvl = node.props?.level ?? 1;
				const text = escapeHtml(node.props?.text ?? '');
				return `<h${lvl} style="${style}"${data}>${text}</h${lvl}>`;
			}
			case 'paragraph':
				return `<p style="${style}"${data}>${escapeHtml(node.props?.text ?? '')}</p>`;
			case 'richtext': {
				const html = node.props?.text ?? '';
				const hasHtml = /<[a-z][\s\S]*>/i.test(html);
				return hasHtml
					? `<div style="${style}"${data}>${html}</div>`
					: `<p style="${style}"${data}>${escapeHtml(html)}</p>`;
			}
			case 'image': {
				const src = escapeAttr(node.props?.src ?? '');
				const alt = escapeAttr(node.props?.alt ?? '');
				return `<img style="${style}" src="${src}" alt="${alt}"${data} />`;
			}
			case 'button': {
				const txt = escapeHtml(node.props?.text ?? 'Button');
				const actions = node.props?.on?.click?.length
					? ` data-actions='${escapeAttr(JSON.stringify(node.props!.on!.click))}'`
					: '';
				if (node.props?.href) {
					const href = escapeAttr(node.props.href);
					return `<a href="${href}" style="${style};text-decoration:none;display:inline-block;"${actions}${data}>${txt}</a>`;
				}
				return `<button style="${style}"${actions}${data}>${txt}</button>`;
			}
			case 'divider': {
				return `<div style="${style}"${data}></div>`;
			}
			case 'list': {
				const tag = node.props?.variant === 'ol' ? 'ol' : 'ul';
				return `<${tag} style="${style}"${data}>${kids.map(walk).join('')}</${tag}>`;
			}
			case 'listItem':
				return `<li style="${style}"${data}>${escapeHtml(node.props?.text ?? '')}</li>`;

			case 'form': {
				const action = node.props?.formAction ?? '';
				const method = node.props?.formMethod ?? 'post';
				const enctype = node.props?.enctype ?? 'application/x-www-form-urlencoded';
				return `<form action="${action}" method="${method}" enctype="${enctype}" style="${style}"${data}>${kids
					.map(walk)
					.join('')}</form>`;
			}

			case 'blockquote': {
				const text = escapeHtml(node.props?.text ?? '');
				const author = node.props?.preAuthor ? escapeHtml(node.props.preAuthor) : '';
				const cite = node.props?.cite ? escapeAttr(node.props.cite) : '';
				const citeAttr = cite ? ` cite="${cite}"` : '';
				const footer = (author || cite) ?
					`<p style="font-size:12px;color:#888;margin-top:8px">` +
					(author ? `${author}` : '') +
					(cite ? `<cite style="margin-left:8px;font-style:italic">(${escapeHtml(cite)})</cite>` : '') +
					`</p>` : '';
				return `<blockquote style="${style}"${citeAttr}${data}>${text}${footer}</blockquote>`;
			}
			case 'input': {
				const type = node.props?.type || 'text';
				const name = escapeAttr(node.props?.name ?? '');
				const value = escapeAttr(node.props?.value ?? '');
				const placeholder = escapeAttr(node.props?.placeholder ?? '');
				const required = node.props?.required ? 'required' : '';
				const disabled = node.props?.disabled ? 'disabled' : '';
				const readonly = node.props?.readonly ? 'readonly' : '';
				const min = node.props?.min ?? '';
				const max = node.props?.max ?? '';
				const step = node.props?.step ?? '';
				const minlength = node.props?.minlength ?? '';
				const maxlength = node.props?.maxlength ?? '';
				const pattern = node.props?.pattern ?? '';
				const title = escapeAttr(node.props?.title ?? '');
				const size = node.props?.size ?? '';
				const autocomplete = node.props?.autocomplete ?? '';
				const autofocus = node.props?.autofocus ? 'autofocus' : '';
				return `<input type="${type}" name="${name}" value="${value}" placeholder="${placeholder}" ${required} ${disabled} ${readonly} min="${min}" max="${max}" step="${step}" minlength="${minlength}" maxlength="${maxlength}" pattern="${pattern}" title="${title}" size="${size}" autocomplete="${autocomplete}" ${autofocus} style="${style}"${data} />`;
			}

			default:
				return `<div style="color:crimson"${data}>Unknown node: ${escapeHtml(node.type)}</div>`;
		}
	};

	const html = walk(schema.nodes[schema.rootId]);
	return { html, css, js };
}

function baseCss(theme: ThemeTokens) {
	const ff =
		theme.typography?.fontFamily ??
		"system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji','Segoe UI Emoji', 'Segoe UI Symbol'";
	return `
  :root { color-scheme: light; }
  body { margin:0; background:${theme.colors.page}; color:${theme.colors.text.base}; font-family:${ff}; }
  img { max-width:100%; display:block; }
  a, button { cursor:pointer; }
  `;
}

function resetCss() {
	return `
  *,*::before,*::after{box-sizing:border-box}
  h1,h2,h3,h4,h5,h6,p{margin:0 0 0.5rem 0}
  `;
}

function runtimeJs() {
	return `
  (function(){
    function runActions(list, evt){
      if(!Array.isArray(list)) return;
      for(const a of list){
        try{
          if(a.type==="openUrl"){
            if(a.target==="blank") window.open(a.url,"_blank");
            else window.location.href=a.url;
          } else if(a.type==="scrollTo"){
            var el = document.querySelector(a.selector);
            if(el){
              var top = el.getBoundingClientRect().top + window.pageYOffset - (a.offset||0);
              window.scrollTo({ top, behavior: a.behavior||"auto" });
            }
          } else if(a.type==="toast"){
            showToast(a.message, a.variant||"info");
          }
        }catch(e){ console.warn("action error", e); }
      }
    }
    function showToast(msg, variant){
      var c = document.createElement("div");
      c.textContent = msg;
      c.style.position="fixed"; c.style.left="50%"; c.style.top="20px"; c.style.transform="translateX(-50%)";
      c.style.padding="10px 14px"; c.style.borderRadius="8px"; c.style.fontSize="14px";
      c.style.background= variant==="success"?"#18a957": variant==="error"?"#d64545":"#3b5bdb";
      c.style.color="#fff"; c.style.boxShadow="0 6px 20px rgba(0,0,0,.12)";
      document.body.appendChild(c);
      setTimeout(()=>{ c.style.opacity="0"; c.style.transition="opacity .2s"; setTimeout(()=>c.remove(),200); }, 1800);
    }
    document.addEventListener("click", function(e){
      var t = e.target;
      while(t && t !== document.body){
        var attr = t.getAttribute("data-actions");
        if(attr){
          try { var actions = JSON.parse(attr); runActions(actions, e); } catch(e){}
          break;
        }
        t = t.parentElement;
      }
    });
  })();
  `;
}

function escapeHtml(s: string) {
	return s.replace(
		/[&<>"']/g,
		(m) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]!,
	);
}
function escapeAttr(s: string) {
	return escapeHtml(s);
}
