import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Box, Center, Stack, Loader, Text, Flex, Button } from '@mantine/core';
import { BlockCard } from '@pages/main/BlockCard.tsx';
import { Filters, SortField, SortOrder } from "@pages/main/Filters";
import { useNavigate } from "react-router-dom";
import { getRouteExistingProject } from "@const/router";
import {
  fetchFirstSitesPage,
  fetchNextSitesPage,
  selectAllSites,
  selectSitesStatus,
  selectHasMoreSites,
  selectIsLoadingMore, PAGE_SIZE,
} from '@/store/slices/siteListSlice';
import { useAppDispatch, useAppSelector } from '@store/hooks.ts';
import { selectAuth } from '@store/slices/authSlice.ts';
import { subscribeToUserSites } from '@/services/firebase/sites.ts';

export const MainPage = () => {
  const { user } = useAppSelector(selectAuth);
  const sites = useAppSelector(selectAllSites);
  const status = useAppSelector(selectSitesStatus);
  const hasMore = useAppSelector(selectHasMoreSites);
  const isLoadingMore = useAppSelector(selectIsLoadingMore);
  const dispatch = useAppDispatch();

  const [nameFilter, setNameFilter] = useState('');
  const [debouncedNameFilter, setDebouncedNameFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedNameFilter(nameFilter);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [nameFilter]);

  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
    field: SortField.TITLE,
    order: SortOrder.ASC
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
        { threshold: 0.1, rootMargin: '100px' }
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

    const unsubscribe = subscribeToUserSites(user.uid, (realTimeSites) => {
      console.log('Real-time update:', realTimeSites);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const filteredBlocks = useMemo(() => {
    let result = sites.map(site => ({
      id: site.id,
      name: site.name,
      date: site.updateAt
    }));

    if (debouncedNameFilter) {
      result = result.filter(block =>
          block.name.toLowerCase().includes(debouncedNameFilter.toLowerCase())
      );
    }

    if (sort.field === SortField.TITLE) {
      result = [...result].sort((a, b) =>
          sort.order === SortOrder.ASC
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name)
      );
    } else if (sort.field === SortField.DATA) {
      result = [...result].sort((a, b) =>
          sort.order === SortOrder.ASC
              ? (b.date || 0) - (a.date || 0)
              : (a.date || 0) - (b.date || 0)
      );
    }

    return result;
  }, [sites, debouncedNameFilter, sort]);

  const handleDelete = (id: string) => {console.log(id)};

  const handleEdit = (id: string) => {
    navigate(getRouteExistingProject(id));
  };

  return (
      <Stack p='md' justify='space-between' h='90vh'>
        <Box>
          <Filters
              nameFilter={nameFilter}
              onNameFilterChange={setNameFilter}
              sort={sort}
              onSortChange={setSort}
          />

          {status === 'loading' && !sites.length && (
              <Center>
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
              <Flex pb='md' gap='md' wrap='wrap' justify='center'>
                {filteredBlocks.map((block) => (
                    <BlockCard
                        key={block.id}
                        block={block}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ))}
              </Flex>
          )}
        </Box>

        <div ref={observerTarget} style={{ height: '20px' }} />

        {isLoadingMore && (
            <Center p='md'>
              <Loader />
            </Center>
        )}
      </Stack>
  );
};