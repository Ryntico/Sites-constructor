import {useState, useMemo, useRef, RefObject, JSX} from 'react';
import { Box, SimpleGrid, Center, Stack, Loader, Text } from '@mantine/core';
import { BlockCard } from '@pages/main/BlockCard.tsx';
import { Filters, SortField, SortOrder } from "@pages/main/Filters";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll.ts";
import { useNavigate } from "react-router-dom";
import {getRouteExistingProject} from "@const/router";

export const MainPage = () => {
  const [blocks, setBlocks] = useState([
    { id: 1, name: "Block 1", date: 1 },
    { id: 2, name: "Block 2", date: 2 },
    { id: 3, name: "Block 3", date: 3 },
    { id: 4, name: "Block 4", date: 4 },
    { id: 5, name: "Block 5", date: 5 },
    { id: 6, name: "Block 6", date: 6 },
    { id: 7, name: "Block 7", date: 7 },
    { id: 8, name: "Block 8", date: 8 },
  ]);

  const triggerRef = useRef<RefObject<HTMLDivElement | undefined>>();
  const wrapperRef = useRef<RefObject<HTMLDivElement | undefined>>();
  const navigate = useNavigate();
  const [nameFilter, setNameFilter] = useState('');
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({ field: SortField.TITLE, order: SortOrder.ASC });
  const isLoading = false;

  const filteredBlocks = useMemo(() => {
    let result = blocks;
    if (nameFilter) {
      result = result.filter(block => block.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (sort.field === SortField.TITLE) {
      result = [...result].sort((a, b) => sort.order === SortOrder.ASC ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
    } else if (sort.field === SortField.DATA) {
      result = [...result].sort((a, b) => sort.order === SortOrder.ASC ? b.date - a.date : a.date - b.date);
    }
    return result;
  }, [blocks, nameFilter, sort]);

  const handleDelete = (id: number) => {
    const updatedBlocks = blocks.filter((block) => block.id !== id);
    setBlocks(updatedBlocks);
  };

  const handleEdit = (id: string) => {
    navigate(getRouteExistingProject(id));
  };

  useInfiniteScroll({
    callback: () => {console.log('trigger api')},
    triggerRef,
    wrapperRef,
  });

  return (
    <Stack p='md' justify='space-between' h='90vh' ref={wrapperRef}>
      <Box>
        <Filters
          nameFilter={nameFilter}
          onNameFilterChange={setNameFilter}
          sort={sort}
          onSortChange={setSort}
        />

        {!blocks.length && (
            <Center>
              <Text ta="center" mt="md">Ничего не найдено</Text>
            </Center>
        ) as JSX.Element}

        <SimpleGrid cols={4} spacing={12} pb='md'>
          {blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </SimpleGrid>
      </Box>
      {isLoading ? (
          <Center w='100vh' p='md'>
            <Loader />
          </Center>
      ): (
          <div ref={triggerRef} />
      )}
    </Stack>
  );
};
