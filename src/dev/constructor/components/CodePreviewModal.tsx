import { useEffect, useMemo, useState } from 'react';
import { prettifyHtml, highlightHtml, splitLines } from '@/utils/prettyHtmlViewer';

type Props = {
	open: boolean;
	html: string;
	onClose: () => void;
	fileName?: string;
	filename?: string; //алиас
	autoCloseAfterCopyMs?: number;
	title?: string;
};

export default function CodePreviewModal({
	open,
	html,
	onClose,
	fileName,
	filename,
	autoCloseAfterCopyMs = 800,
	title = 'Исходный HTML (экспорт)',
}: Props) {
	const pretty = useMemo(() => prettifyHtml(html), [html]);
	const highlighted = useMemo(() => highlightHtml(pretty), [pretty]);
	const lines = useMemo(() => splitLines(highlighted), [highlighted]);

	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!open) setCopied(false);
	}, [open]);

	if (!open) return null;

	const finalFileName = fileName || filename || 'export.html';

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(pretty);
			setCopied(true);
			if (autoCloseAfterCopyMs > 0) {
				setTimeout(() => onClose(), autoCloseAfterCopyMs);
			}
		} catch {
			// no-op
		}
	};

	const handleDownload = () => {
		const blob = new Blob([pretty], { type: 'text/html;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.download = finalFileName;
		a.href = url;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="code-modal__overlay" role="dialog" aria-modal="true">
			<div className="code-modal">
				<div className="code-modal__header">
					<strong>{title}</strong>
					<div className="code-modal__actions">
						<button className="btn" onClick={handleCopy}>
							{copied ? 'Скопировано' : 'Скопировать'}
						</button>
						<button className="btn" onClick={handleDownload}>
							Скачать
						</button>
						<button className="btn btn--ghost" onClick={onClose}>
							Закрыть
						</button>
					</div>
				</div>

				<div className="code-modal__body">
					<ol className="code">
						{lines.map((line, i) => (
							<li key={i}>
								<code
									dangerouslySetInnerHTML={{
										__html: line.length ? line : '&nbsp;',
									}}
								/>
							</li>
						))}
					</ol>
				</div>
			</div>

			<style>{`
        .code-modal__overlay{
          position: fixed; inset: 0;
          background: rgba(15,23,42,.35);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 24px;
          z-index: 1000;
        }
        .code-modal{
          width: min(1100px, 96vw);
          max-height: calc(100vh - 48px);
          display: grid; grid-template-rows: auto 1fr;
          background: #f8fafc;
          border: 1px solid #e6e8ef;
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(15, 23, 42, .22);
          overflow: hidden;
        }
        .code-modal__header{
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 12px 14px; background: #fff; border-bottom: 1px solid #e6e8ef;
        }
        .code-modal__actions{ display: flex; gap: 8px; }
        .btn{
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid #d0d3dc;
          background:#fff;
          font-size: 12px; cursor:pointer;
        }
        .btn:hover{ background:#f5f7fb; }
        .btn:disabled{ opacity:.6; cursor:default; }
        .btn--ghost{ background:#fff; }

        .code-modal__body{
          overflow: auto;
          background: #0b1220;
        }
        .code{
          counter-reset: line;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12px; line-height: 1.45;
          color: #e2e8f0;
          margin: 0; padding: 8px 0;
          min-width: 900px;
        }
        .code > li{
          list-style: none;
          display: grid; grid-template-columns: 56px 1fr;
          align-items: start;
          padding: 0 12px;
          white-space: nowrap;
        }
        .code > li::before{
          counter-increment: line;
          content: counter(line);
          color: #7482a9;
          text-align: right;
          padding-right: 12px;
          user-select: none;
        }
        .code > li > code{
          display: block;
          white-space: pre;
        }

        .tok-n { color: #7dd3fc; }
        .tok-a { color: #86efac; }
        .tok-v { color: #f0abfc; }
        .tok-o { color: #94a3b8; }
        .tok-c { color: #9aa7c7; font-style: italic; }
      `}</style>
		</div>
	);
}
