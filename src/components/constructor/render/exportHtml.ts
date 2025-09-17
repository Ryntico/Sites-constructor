import type { PageSchema, NodeJson, ThemeTokens, Action } from '@/types/siteTypes.ts';
import { mergeResponsive, styleObjToCss } from './responsive.ts';
import { serializeActionsAttr, isHtml, asInputMode, asWrap } from './helpers.ts';

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
				return isHtml(html)
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
				const serialized = serializeActionsAttr(
					node.props?.on as Record<'click', Action[]> | undefined,
				);
				const actionsAttr = serialized
					? ` data-actions='${escapeAttr(serialized)}'`
					: '';
				if (node.props?.href) {
					const href = escapeAttr(node.props.href);
					return `<a href="${href}" style="${style};text-decoration:none;display:inline-block;"${actionsAttr}${data}>${txt}</a>`;
				}
				return `<button style="${style}"${actionsAttr}${data}>${txt}</button>`;
			}

			case 'divider':
				return `<div style="${style}"${data}></div>`;

			case 'list': {
				const tag = node.props?.variant === 'ol' ? 'ol' : 'ul';
				return `<${tag} style="${style}"${data}>${kids.map(walk).join('')}</${tag}>`;
			}

			case 'listItem':
				return `<li style="${style}"${data}>${escapeHtml(node.props?.text ?? '')}</li>`;

			case 'form': {
				const formId = node.props?.formId ?? '';
				const action = node.props?.formAction ?? '';
				const method = node.props?.formMethod ?? 'post';
				const enctype =
					node.props?.enctype ?? 'application/x-www-form-urlencoded';
				return `<form id="${escapeAttr(formId)}" action="${escapeAttr(
					action,
				)}" method="${escapeAttr(method)}" enctype="${escapeAttr(enctype)}" style="${style}"${data}>${kids
					.map(walk)
					.join('')}</form>`;
			}

			case 'blockquote': {
				const text = escapeHtml(node.props?.text ?? '');
				const author = node.props?.preAuthor
					? escapeHtml(node.props.preAuthor)
					: '';
				const cite = node.props?.cite ? escapeAttr(node.props.cite) : '';
				const citeAttr = cite ? ` cite="${cite}"` : '';
				const footer =
					author || cite
						? `<p style="font-size:12px;color:#888;margin-top:8px">${author}${
								cite
									? `<cite style="margin-left:8px;font-style:italic">(${escapeHtml(cite)})</cite>`
									: ''
							}</p>`
						: '';
				return `<blockquote style="${style}"${citeAttr}${data}>${text}${footer}</blockquote>`;
			}

			case 'input': {
				const id = `input-${node.id}`;
				const inputMode = asInputMode(node.props?.inputmode) ?? '';
				const spellAttr =
					typeof node.props?.spellcheck === 'boolean'
						? String(node.props.spellcheck)
						: 'true';
				const inputHtml = `
          <input 
            type="${escapeAttr(node.props?.type || 'text')}" 
            id="${escapeAttr(id)}"
            name="${escapeAttr(node.props?.name || '')}" 
            value="${escapeAttr(node.props?.value || '')}" 
            placeholder="${escapeAttr(node.props?.placeholder || '')}" 
            ${node.props?.required ? 'required' : ''} 
            ${node.props?.disabled ? 'disabled' : ''} 
            ${node.props?.readonly ? 'readonly' : ''} 
            min="${escapeAttr(String(node.props?.min ?? ''))}" 
            max="${escapeAttr(String(node.props?.max ?? ''))}" 
            step="${escapeAttr(String(node.props?.step ?? ''))}" 
            minlength="${escapeAttr(String(node.props?.minlength ?? ''))}" 
            maxlength="${escapeAttr(String(node.props?.maxlength ?? ''))}" 
            pattern="${escapeAttr(node.props?.pattern || '')}" 
            title="${escapeAttr(node.props?.title || '')}" 
            size="${escapeAttr(String(node.props?.size ?? ''))}" 
            ${node.props?.autocomplete ? 'autocomplete="on"' : ''} 
            ${node.props?.autofocus ? 'autofocus' : ''} 
            ${inputMode ? `inputmode="${inputMode}"` : ''} 
            spellcheck="${spellAttr}"
            dir="${escapeAttr(node.props?.dir || 'auto')}"
            style="${style}"
            ${data} 
          />`;
				return node.props?.label
					? `<div style="display:flex;flex-direction:column;gap:4px">
               <label for="${escapeAttr(id)}" style="font-size:14px;color:#4a5568">${escapeHtml(
					node.props.label,
				)}</label>${inputHtml}
             </div>`
					: inputHtml;
			}

			case 'textarea': {
				const id = `textarea-${node.id}`;
				const wrap = asWrap(node.props?.wrap) ?? 'soft';
				const spellAttr =
					typeof node.props?.spellcheck === 'boolean'
						? String(node.props.spellcheck)
						: 'true';
				const textareaHtml = `
          <textarea 
            id="${escapeAttr(id)}"
            name="${escapeAttr(node.props?.name || '')}" 
            rows="${escapeAttr(String(node.props?.rows ?? 5))}" 
            cols="${escapeAttr(String(node.props?.cols ?? 20))}" 
            placeholder="${escapeAttr(node.props?.placeholder || '')}" 
            ${node.props?.required ? 'required' : ''} 
            ${node.props?.disabled ? 'disabled' : ''} 
            ${node.props?.readonly ? 'readonly' : ''} 
            maxlength="${escapeAttr(String(node.props?.maxlength ?? ''))}" 
            minlength="${escapeAttr(String(node.props?.minlength ?? ''))}" 
            ${node.props?.autofocus ? 'autofocus' : ''} 
            form="${escapeAttr(node.props?.formId || '')}" 
            wrap="${wrap}" 
            ${node.props?.autocomplete ? 'autocomplete="on"' : ''}
            spellcheck="${spellAttr}" 
            dir="${escapeAttr(node.props?.dir || 'auto')}" 
            title="${escapeAttr(node.props?.title || '')}" 
            style="${style};resize:vertical;min-height:100px"
            ${data} 
          >${escapeHtml(node.props?.value || '')}</textarea>`;
				return node.props?.label
					? `<div style="display:flex;flex-direction:column;gap:4px">
               <label for="${escapeAttr(id)}" style="font-size:14px;color:#4a5568">${escapeHtml(
					node.props.label,
				)}</label>${textareaHtml}
             </div>`
					: textareaHtml;
			}

			case 'select': {
				const id = `select-${node.id}`;
				const opts: Array<{ value: string; text: string }> = Array.isArray(
					node.props?.options,
				)
					? (node.props?.options as Array<{ value: string; text: string }>)
					: [];
				const options = opts
					.map(
						(o) =>
							`<option value="${escapeAttr(o.value)}">${escapeHtml(o.text)}</option>`,
					)
					.join('');
				const selectHtml = `
          <select 
            id="${escapeAttr(id)}"
            name="${escapeAttr(node.props?.name || '')}" 
            ${node.props?.disabled ? 'disabled' : ''} 
            ${node.props?.required ? 'required' : ''} 
            ${node.props?.autofocus ? 'autofocus' : ''} 
            ${node.props?.multiple ? 'multiple' : ''} 
            size="${escapeAttr(String(node.props?.size ?? ''))}" 
            form="${escapeAttr(node.props?.formId || '')}" 
            style="${style}"
            ${data} 
          >${options}</select>`;
				return node.props?.label
					? `<div style="display:flex;flex-direction:column;gap:4px">
               <label for="${escapeAttr(id)}" style="font-size:14px;color:#4a5568">${escapeHtml(
					node.props.label,
				)}</label>${selectHtml}
             </div>`
					: selectHtml;
			}

			case 'anchor':
				return `<div id="${escapeAttr(node.id)}" style="${style}"${data}></div>`;

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
  blockquote {
    background: ${theme.components?.blockquote?.bg || 'rgba(99, 102, 241, 0.1)'};
    border-left: ${theme.components?.blockquote?.borderLeft || '4px solid rgb(59, 130, 246)'};
    border-radius: ${theme.components?.blockquote?.radius ?? 8}px;
    padding: ${theme.components?.blockquote?.p || '16px 20px'};
    color: ${theme.components?.blockquote?.color || 'inherit'};
    font-style: italic;
  }
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
    document.addEventListener("submit", function(e){
	  const form = e.target;
	  if (!(form instanceof HTMLFormElement)) return;
	  e.preventDefault();
	
	  try {
		const fd = new FormData(form);
		const obj = {};
		fd.forEach((v, k) => {
		  if (obj[k] !== undefined) {
			if (Array.isArray(obj[k])) obj[k].push(v);
			else obj[k] = [obj[k], v];
		  } else obj[k] = v;
		});
		console.log("Form data:", obj);
	  } catch {}
	
	  showToast("Форма отправлена", "success");
	  form.reset();
	}, true);
  })();
  `;
}

function escapeHtml(s: string) {
	return s.replace(
		/[&<>"']/g,
		(m) =>
			(
				({
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#39;',
				}) as const
			)[m]!,
	);
}
function escapeAttr(s: string) {
	return escapeHtml(s);
}
