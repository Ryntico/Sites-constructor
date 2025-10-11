import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
	Box, Center, Stack, Loader, Text, Flex, Button,
	Modal, Group, Alert, Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { BlockCard } from '@components/mainPage/BlockCard.tsx';
import { Filters, SortField, SortOrder } from '@components/mainPage/Filters.tsx';
import { useNavigate } from 'react-router-dom';
import { getRouteExistingProject } from '@const/router.ts';
import {
	fetchFirstSitesPage,
	fetchNextSitesPage,
	deleteSite,
	selectAllSites,
	selectSitesStatus,
	selectHasMoreSites,
	selectIsLoadingMore,
	PAGE_SIZE,
} from '@store/slices/siteListSlice.ts';
import { useAppDispatch, useAppSelector } from '@store/hooks.ts';
import { selectAuth } from '@store/slices/authSlice.ts';
import { subscribeToUserSites } from '@/services/firebase/sites.ts';
import TemplatesCarousel from '@components/mainPage/TemplatesCarousel.tsx';
import { IconAlertCircle, IconTrash } from '@components/ui/icons';

export const MainPage = () => {
	const { user } = useAppSelector(selectAuth);
	const sites = useAppSelector(selectAllSites);
	const status = useAppSelector(selectSitesStatus);
	const hasMore = useAppSelector(selectHasMoreSites);
	const isLoadingMore = useAppSelector(selectIsLoadingMore);
	const dispatch = useAppDispatch();

	const [nameFilter, setNameFilter] = useState('');
	const [debouncedNameFilter, setDebouncedNameFilter] = useState('');
	const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
	const [opened, { open, close }] = useDisclosure(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedNameFilter(nameFilter);
		}, 300);

		return () => clearTimeout(timer);
	}, [nameFilter]);

	const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
		field: SortField.DATA,
		order: SortOrder.ASC,
	});

	const navigate = useNavigate();
	const observerTarget = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (user?.uid) {
			dispatch(fetchFirstSitesPage({ ownerId: user.uid, pageSize: PAGE_SIZE }));
		}
	}, [dispatch, user?.uid]);

	const loadMore = useCallback(() => {
		if (user?.uid && hasMore && status !== 'loading' && status !== 'loading-more') {
			dispatch(fetchNextSitesPage({ ownerId: user.uid }));
		}
	}, [dispatch, user?.uid, hasMore, status]);

	useEffect(() => {
		if (!hasMore || status === 'loading' || status === 'loading-more') return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					loadMore();
				}
			},
			{ threshold: 0.1, rootMargin: '100px' },
		);

		const currentTarget = observerTarget.current;
		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [hasMore, status, loadMore]);

	useEffect(() => {
		if (!user?.uid) return;

		const unsubscribe = subscribeToUserSites(user.uid, () => {
		});

		return () => unsubscribe();
	}, [user?.uid]);

	const handleDeleteClick = (id: string) => {
		setSiteToDelete(id);
		open();
	};

	const handleConfirmDelete = async () => {
		if (siteToDelete) {
			try {
				await dispatch(deleteSite(siteToDelete)).unwrap();
				close();
				setSiteToDelete(null);
			} catch (error) {
				console.error('Failed to delete siteNameEditor:', error);
			}
		}
	};

	const handleCancelDelete = () => {
		close();
		setSiteToDelete(null);
	};

	const filteredBlocks = useMemo(() => {
		let result = sites.map(site => ({
			id: site.id,
			name: site.name,
			date: site.updateAt,
			homePage: site.homePage,
		}));

		if (debouncedNameFilter) {
			result = result.filter(block =>
				block.name.toLowerCase().includes(debouncedNameFilter.toLowerCase()),
			);
		}

		if (sort.field === SortField.TITLE) {
			result = [...result].sort((a, b) =>
				sort.order === SortOrder.ASC
					? a.name.localeCompare(b.name)
					: b.name.localeCompare(a.name),
			);
		} else if (sort.field === SortField.DATA) {
			result = [...result].sort((a, b) =>
				sort.order === SortOrder.ASC
					? (b.date || 0) - (a.date || 0)
					: (a.date || 0) - (b.date || 0),
			);
		}

		return result;
	}, [sites, debouncedNameFilter, sort]);

	const handleEdit = (id: string) => {
		navigate(getRouteExistingProject(id));
	};

	const siteToDeleteName = siteToDelete
		? sites.find(site => site.id === siteToDelete)?.name
		: '';

	return (
		<Stack p="md" justify="space-between" h="90vh">
			<Box>
				<TemplatesCarousel />

				<Center mb="md">
					<Title order={1} c='dimmed'>Мои сайты</Title>
				</Center>
				<Filters
					nameFilter={nameFilter}
					onNameFilterChange={setNameFilter}
					sort={sort}
					onSortChange={setSort}
				/>

				{status === 'loading' && !sites.length && (
					<Center h="calc(100vh - 160px)">
						<Loader />
					</Center>
				)}

				{status === 'succeeded' && filteredBlocks.length === 0 && (
					<Center>
						<Text ta="center" mt="md">Ничего не найдено</Text>
					</Center>
				)}

				{status === 'error' && (
					<Center>
						<Text c="red">Ошибка загрузки</Text>
						<Button onClick={() => user?.uid && dispatch(fetchFirstSitesPage({ ownerId: user.uid }))}>
							Повторить
						</Button>
					</Center>
				)}

				{filteredBlocks.length > 0 && (
					<Flex pb="md" gap="md" wrap="wrap" justify="center">
						{filteredBlocks.map((block) => (
							<BlockCard
								key={block.id}
								block={block}
								onDelete={() => handleDeleteClick(block.id)}
								onEdit={handleEdit}
							/>
						))}
					</Flex>
				)}
			</Box>

			<div ref={observerTarget} style={{ height: '20px' }} />

			{isLoadingMore && (
				<Center p="md">
					<Loader />
				</Center>
			)}

			<Modal
				opened={opened}
				onClose={handleCancelDelete}
				title="Подтверждение удаления"
				centered
			>
				<Alert
					icon={<IconAlertCircle />}
					title="Внимание!"
					color="red"
					mb="md"
				>
					Вы уверены, что хотите удалить сайт "{siteToDeleteName}"? Это действие нельзя отменить.
				</Alert>

				<Group justify="flex-end">
					<Button variant="default" onClick={handleCancelDelete}>
						Отмена
					</Button>
					<Button
						color="red"
						onClick={handleConfirmDelete}
						loading={status === 'loading'}
						leftSection={<IconTrash />}
					>
						Удалить
					</Button>
				</Group>
			</Modal>
		</Stack>
	);
};