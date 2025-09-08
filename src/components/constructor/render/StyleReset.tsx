import type { ThemeTokens } from '@/types/siteTypes';

export function StyleReset({
	theme,
	scope = '[data-preview-root]',
}: {
	theme: ThemeTokens;
	scope?: string;
}) {
	const css = `
    ${scope} *, ${scope} *::before, ${scope} *::after { box-sizing: border-box; }
    ${scope} h1, ${scope} h2, ${scope} h3, ${scope} h4, ${scope} h5, ${scope} h6, ${scope} p { margin: 0 0 .5rem 0; }
    ${scope} img { max-width: 100%; display: block; }
    ${scope} a, ${scope} button { cursor: pointer; }

    ${scope} blockquote {
      background: ${theme.components?.blockquote?.bg ?? 'rgba(99, 102, 241, 0.1)'};
      border-left: ${theme.components?.blockquote?.borderLeft ?? '4px solid rgb(59, 130, 246)'};
      border-radius: ${theme.components?.blockquote?.radius ?? 8}px;
      padding: ${theme.components?.blockquote?.p ?? '16px 20px'};
      ${theme.components?.blockquote?.color ? `color: ${theme.components.blockquote.color};` : ''}
      font-style: italic;
    }
  `;
	return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
