import { Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { getRouteExistingProject, getRouteMain } from '@/const/router.ts';
import { useAppSelector } from '@store/hooks.ts';
import { selectAuth } from '@store/slices/authSlice.ts';
import { useSiteBuilder } from '@hooks/useSiteBuilder.ts';
import { useState } from 'react';

export const HeaderNavigation = () => {
	const [isCreating, setIsCreating] = useState(false);
	const [isCreatingFromTemplate, setIsCreatingFromTemplate] = useState(false);
	const navigate = useNavigate();
	const { user } = useAppSelector(selectAuth);
	const { createEmptySiteId, createSiteFromTemplateId } = useSiteBuilder('', 'home');

	return (
		<Group wrap="nowrap">
			<Button variant="subtle" onClick={() => navigate(getRouteMain())}>
				Главная
			</Button>
			<Button variant="subtle"
					loading={isCreating}
					onClick={async () => {
						try {
							setIsCreating(true);
							const newId = await createEmptySiteId({
								ownerId: user?.uid,
								siteName: 'Мой сайт',
								firstPageId: 'home',
								firstPageTitle: 'Home',
								firstPageRoute: '/',
							});
							navigate(getRouteExistingProject(newId));
						} finally {
							setIsCreating(false);
						}
					}}
			>
				Новый сайт
			</Button>
			<Button
				variant="subtle"
				loading={isCreatingFromTemplate}
				onClick={async () => {
					try {
						setIsCreatingFromTemplate(true);
						const id = await createSiteFromTemplateId({
							ownerId: user?.uid,
							name: 'Demo site',
							templateId: 'base-smoke',
						});
						navigate(getRouteExistingProject(id));
					} finally {
						setIsCreatingFromTemplate(false);
					}
				}}
			>
				Сайт из шаблона
			</Button>
		</Group>
	);
};
