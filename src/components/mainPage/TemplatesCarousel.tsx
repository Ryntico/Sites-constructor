import { useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { selectAuth } from '@store/slices/authSlice.ts';
import { useSiteBuilder } from '@hooks/useSiteBuilder.ts';
import { getRouteExistingProject } from '@const/router.ts';
import { Card, Text, Button, Container, Center, Loader, Title, Divider } from '@mantine/core';
import { useAppDispatch, useAppSelector } from '@store/hooks.ts';
import { loadTemplates, selectTemplates } from '@store/slices/templatesSlice.ts';
import { RenderTree } from '@components/constructor/render/Renderer.tsx';
import type { PageTemplateWithThemeDoc } from '@/types/siteTypes.ts';

export const TemplatesCarousel = () => {
	const dispatch = useAppDispatch();
	const { pagesWithThemes: templates, status } = useAppSelector(selectTemplates);
	const [loadingState, dispatchLoading] = useReducer((
		prevState,
		action: { id: string, loading: boolean },
	) => {
		const newState = {
			...prevState,
			[action.id]: action.loading,
		};
		return newState;
	}, {} as { [id: string]: boolean });
	const navigate = useNavigate();
	const { createSiteFromTemplateIdWithTheme } = useSiteBuilder('', 'home');
	const { user } = useAppSelector(selectAuth);
	const autoplay = useRef(Autoplay({ delay: 1500 }));

	useEffect(() => {
		if (status === 'idle') {
			dispatch(loadTemplates());
		}
	}, [dispatch, status]);

	const handleCreateFromTemplate = async (template: PageTemplateWithThemeDoc) => {
		try {
			dispatchLoading({ id: template.page.id, loading: true });
			const siteId = await createSiteFromTemplateIdWithTheme({
				ownerId: user?.uid,
				name: 'Demo site',
				template,
			});
			navigate(getRouteExistingProject(siteId));
		} catch (error) {
			console.error('Failed to create site from template:', error);
		} finally {
			dispatchLoading({ id: template.page.id, loading: false });
		}
	};

	return (
		status !== 'succeeded' ? (
				<Center h="100vh">
					<Loader />
				</Center>
			) :
			templates &&
			<Container size="xl" pt="xs" pb="xl">
				<Center mb="md">
					<Title order={1} c="dimmed">Шаблоны</Title>
				</Center>
				<Carousel
					withIndicators
					withControls
					controlsOffset="xl"
					controlSize="40"
					slideGap="xl"
					slideSize={{ base: '100%', sm: '70%', md: '50%', lg: '33.33333%' }}
					emblaOptions={{
						loop: true,
						dragFree: false,
						align: 'center',
					}}
					plugins={[autoplay.current]}
					onMouseEnter={autoplay.current.stop}
					onMouseLeave={() => autoplay.current.play()}
				>
					{templates.map((template) => (
						<Carousel.Slide key={template.page.id}>
							<Button
								variant="light"
								color="blue"
								fullWidth
								h="36px"
								radius="md"
								onClick={() => handleCreateFromTemplate(template)}
								loading={loadingState[template.page.id]}
							>
								Выбрать шаблон
							</Button>
							<Card shadow="md" h="calc(100vh - 300px)" padding="lg" radius="md">
								{template.page.schema ? (
									<div
										style={{
											transform: 'scale(0.5)',
											transformOrigin: 'top left',
											width: '200%',
											height: '200%',
											pointerEvents: 'none',
											position: 'absolute',
											top: 0,
											left: 0,
										}}
									>
										<RenderTree
											schema={template.page.schema}
											theme={template.theme}
										/>
									</div>
								) : (
									<Center h="100%">
										<Text c="dimmed" size="sm">
											Нет превью
										</Text>
									</Center>
								)}
							</Card>
						</Carousel.Slide>
					))}
				</Carousel>
				<Divider my="md" />
			</Container>

	);
};

export default TemplatesCarousel;
