import { useState, useMemo } from 'react';
import { Pagination, Box, SimpleGrid, Center, Stack, Loader, Text } from '@mantine/core';
import { BlockCard } from '@pages/main/BlockCard.tsx';
import { Filters, SortField, SortOrder } from "@pages/main/Filters";

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
  
  const [nameFilter, setNameFilter] = useState('');
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({ field: SortField.TITLE, order: SortOrder.ASC });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

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

  const handleEdit = (id: number) => {
    console.log(`Edit block with ID: ${id}`);
  };

  const totalPages = Math.ceil(filteredBlocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlocks = filteredBlocks.slice(startIndex, endIndex);

  const isLoading = false;

  if(isLoading) {
    return (
        <Center р="100vh" p='md'>
          <Loader />
        </Center>
    )
  }

  return (
    <Stack p='md' justify='space-between' h='90vh'>
      <Box>
        <Filters
          nameFilter={nameFilter}
          onNameFilterChange={setNameFilter}
          sort={sort}
          onSortChange={setSort}
        />

        {!currentBlocks.length && (
            <Center>
              <Text ta="center" mt="md">Ничего не найдено</Text>
            </Center>
        )}

        <SimpleGrid cols={4} spacing={12} pb='md'>
          {currentBlocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </SimpleGrid>
      </Box>
      <Center>
        <Pagination
          total={totalPages}
          page={currentPage}
          onChange={setCurrentPage}
        />
      </Center>
    </Stack>
  );
};
