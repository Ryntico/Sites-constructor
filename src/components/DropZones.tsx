import React, { useLayoutEffect, useRef, useState } from 'react';
import type { Axis } from '@/types/siteTypes.ts';
import {
	TYPE_TPL,
	TYPE_MOVE,
	TYPE_COPY_INTENT,
} from '@/components/constructor/runtime/dnd/constants.ts';
import { typesToArray } from '@/components/constructor/runtime/dnd/utils.ts';

type Props = {
	onDrop: (tplKey?: string, moveNodeId?: string, opts?: { copy?: boolean }) => void;
	scrollContainer?: React.RefObject<HTMLElement>;
	visible?: boolean;
	axis?: Axis;
	matchId?: string;
	copyKeyRef?: React.RefObject<boolean>;
	isMac?: boolean;
};

export function DropZone({
	onDrop,
	scrollContainer,
	visible = false,
	axis = 'y',
	matchId,
	copyKeyRef,
	isMac = false,
}: Props) {
	const selfRef = useRef<HTMLDivElement>(null);
	const [over, setOver] = useState(false);
	const [box, setBox] = useState<{
		w: number;
		h: number;
		left: number;
		top: number;
	} | null>(null);

	useLayoutEffect(() => {
		if (!visible || !matchId || !selfRef.current) {
			setBox(null);
			return;
		}
		const target = document.querySelector<HTMLElement>(`[data-res-id="${matchId}"]`);
		const parent = selfRef.current.parentElement as HTMLElement | null;
		if (!target || !parent) return;

		const measure = () => {
			const r = target.getBoundingClientRect();
			const pr = parent.getBoundingClientRect();
			setBox({
				w: Math.max(0, Math.round(r.width)),
				h: Math.max(0, Math.round(r.height)),
				left: Math.max(0, Math.round(r.left - pr.left)),
				top: Math.max(0, Math.round(r.top - pr.top)),
			});
		};

		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(target);
		window.addEventListener('resize', measure);
		const sc = scrollContainer?.current;
		if (sc) sc.addEventListener('scroll', measure, { passive: true });

		return () => {
			ro.disconnect();
			window.removeEventListener('resize', measure);
			if (sc) sc.removeEventListener('scroll', measure);
		};
	}, [visible, matchId, scrollContainer]);

	if (!visible) return null;

	const accepts = (dt: DataTransfer): boolean => {
		const arr = typesToArray(dt.types);
		return arr.includes(TYPE_TPL) || arr.includes(TYPE_MOVE);
	};

	const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
		const dt = e.dataTransfer;
		if (!accepts(dt)) return;
		e.preventDefault();

		try {
			const wantCopy =
				(copyKeyRef?.current ?? false) ||
				(isMac ? e.altKey : e.ctrlKey || e.altKey);
			const isMove = typesToArray(dt.types).includes(TYPE_MOVE);
			dt.dropEffect = wantCopy ? 'copy' : isMove ? 'move' : 'copy';
		} catch {
			// no ops
		}

		setOver(true);

		const el = scrollContainer?.current;
		if (el) {
			const rect = el.getBoundingClientRect();
			const M = 80;
			if (e.clientY < rect.top + M) el.scrollTop -= 12;
			else if (e.clientY > rect.bottom - M) el.scrollTop += 12;
			if (e.clientX < rect.left + M) el.scrollLeft -= 12;
			else if (e.clientX > rect.right - M) el.scrollLeft += 12;
		}
	};

	const handleDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
		const rt = e.relatedTarget as Node | null;
		if (!rt || e.currentTarget.contains(rt)) return;
		setOver(false);
	};

	const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
		e.preventDefault();
		setOver(false);
		const dt = e.dataTransfer;
		const tplKey = dt.getData(TYPE_TPL);
		const moveId = dt.getData(TYPE_MOVE);
		const copyIntent = dt.getData(TYPE_COPY_INTENT) === '1';
		const copyNow =
			(copyKeyRef?.current ?? false) || (isMac ? e.altKey : e.ctrlKey || e.altKey);
		const copy = copyIntent || copyNow;

		if (tplKey) onDrop(tplKey, undefined, { copy });
		else if (moveId) onDrop(undefined, moveId, { copy });
	};

	const THICK = 14;
	const GAP = 3;

	const base: React.CSSProperties = {
		border: `2px dashed ${over ? '#5c7cfa' : '#e6e8ef'}`,
		borderRadius: 8,
		background: over ? 'rgba(92,124,250,0.08)' : 'transparent',
		transition: 'background .12s, border-color .12s',
		zIndex: 3,
	};

	const style: React.CSSProperties =
		axis === 'x'
			? {
					...base,
					width: THICK,
					height: box?.h ?? undefined,
					alignSelf: 'flex-start',
					margin: `0 ${GAP}px`,
					flex: `0 0 ${THICK}px`,
					...(box ? { marginTop: box.top } : null),
				}
			: {
					...base,
					height: THICK,
					width: box?.w ?? undefined,
					alignSelf: 'flex-start',
					margin: `${GAP}px 0`,
					...(box ? { marginLeft: box.left } : null),
				};

	return (
		<div
			ref={selfRef}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			style={style}
			title="Перетащите сюда"
		/>
	);
}
