import React from 'react';

export function InspectorSection({
									 title,
									 children
								 }: {
	title?: string;
	children: React.ReactNode;
}) {
	return (
		<div style={{ borderTop: '1px solid #eef1f6', paddingTop: 10 }}>
			{title && <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>}
			{children}
		</div>
	);
}