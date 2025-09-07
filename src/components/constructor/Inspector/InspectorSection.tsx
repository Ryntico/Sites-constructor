import React from 'react';
import { Paper, Text } from '@mantine/core';

export function InspectorSection({
									 title,
									 children
								 }: {
	title?: string;
	children: React.ReactNode;
}) {
	return (
		<Paper
			withBorder={false}
			style={{
				borderTop: '1px solid #eef1f6',
				paddingTop: 10,
				backgroundColor: 'transparent'
			}}
		>
			{title && (
				<Text
					fw={600}
					mb="sm"
				>
					{title}
				</Text>
			)}
			{children}
		</Paper>
	);
}