import { Popover, TextInput, Radio, Box, ActionIcon, Center } from '@mantine/core';
import { useDisclosure } from "@mantine/hooks";

const SortIcon = () =>
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#74C0fC"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M3 9l4 -4l4 4m-4 -4v14" />
        <path d="M21 15l-4 4l-4 -4m4 4v-14" />
    </svg>


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
                />
            </Box>
            <Center>
                <Popover position="bottom" withArrow shadow="md">
                    <Popover.Target>
                        <ActionIcon variant="subtle" onClick={toggle}>
                            <SortIcon></SortIcon>
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
        </Box>
)
}