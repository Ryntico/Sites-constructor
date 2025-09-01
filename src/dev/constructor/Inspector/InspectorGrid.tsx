import React from 'react';
import { Grid } from '@mantine/core';

export function InspectorGrid({
								  cols = 2,
								  children,
								  style,
							  }: {
	cols?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
}) {
	return (
		<Grid
			gutter="xs"
			style={style}
			columns={cols}
		>
			{React.Children.map(children, (child) => (
				<Grid.Col span={1}>{child}</Grid.Col>
			))}
		</Grid>
	);
}