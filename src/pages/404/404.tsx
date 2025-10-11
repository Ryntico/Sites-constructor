import { Button, Center, Container, Group, Text, Title } from '@mantine/core';
import classes from './NothingFoundBackground.module.css';
import { Link } from 'react-router-dom';
import { IconIllustration } from '@components/ui/icons';

export function NothingFoundBackground() {
	return (
		<Container className={classes.root}>
			<div className={classes.inner}>
				<IconIllustration className={classes.image} />
					<div className={classes.content}>
						<Title className={classes.title}>Nothing to see here</Title>
						<Center>
							<Text c="dimmed" mt="sm" size="lg" ta="center" className={classes.description}>
								Page you are trying to open does not exist. You may have mistyped the address, or the
								page has been moved to another URL. If you think this is an error contact support.
							</Text>
						</Center>
						<Group justify="center" mt="lg" gap="lg">
							<Button
								component={Link}
								to="/"
								size="md">Take me back to home page</Button>
						</Group>
					</div>
			</div>
		</Container>
	);
}