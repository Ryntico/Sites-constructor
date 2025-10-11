import { Popover, TextInput, Radio, Box, ActionIcon, Center } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";
import { IconSort } from "@/components/ui/icons";

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum SortField {
    TITLE = 'title',
    DATA = 'data'
}

const sortOptions = [
    { label: 'a-z', value: { field: SortField.TITLE, order: SortOrder.ASC } },
    { label: 'z-a', value: { field: SortField.TITLE, order: SortOrder.DESC } },
    { label: 'сначала новые', value: { field: SortField.DATA, order: SortOrder.ASC } },
    { label: 'сначала старые', value: { field: SortField.DATA, order: SortOrder.DESC } },
];

interface FiltersProps {
    nameFilter: string;
    onNameFilterChange: (newTitle: string) => void;
    sort: { field: SortField; order: SortOrder };
    onSortChange: (newSort: { field: SortField; order: SortOrder }) => void;
}

export const Filters = ({ nameFilter, onNameFilterChange, sort, onSortChange }: FiltersProps) => {
    const [, { toggle, close }] = useDisclosure();

    return (
        <Box display='flex' pb='md'>
            <Box flex='1' pr='md'>
                <TextInput
                    placeholder="Поиск по названию"
                    value={nameFilter}
                    onChange={(e) => onNameFilterChange(e.target.value)}
                    rightSection={
                        <Center>
                            <Popover position="bottom" withArrow shadow="md">
                                <Popover.Target>
                                    <ActionIcon variant="subtle" onClick={toggle}>
                                        <IconSort></IconSort>
                                    </ActionIcon>
                                </Popover.Target>
                                <Popover.Dropdown>
                                    <Radio.Group
                                        value={sort ? JSON.stringify(sort) : ''}
                                        onChange={(val) => {
                                            const parsed = JSON.parse(val);
                                            onSortChange(parsed);
                                            close();
                                        }}
                                    >
                                        {sortOptions.map(({ value, label }) => (
                                            <Radio
                                                key={label}
                                                label={label}
                                                value={JSON.stringify(value)}
                                            />
                                        ))}
                                    </Radio.Group>
                                </Popover.Dropdown>
                            </Popover>
                        </Center>
                    }
                />
            </Box>
        </Box>
)
}