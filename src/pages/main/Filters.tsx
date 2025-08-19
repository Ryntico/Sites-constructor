import { Burger, Popover, TextInput, Radio, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from 'react'

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
    const [opened, { toggle, close }] = useDisclosure();

    return (
        <Box display='flex' pb='md'>
            <Box flex='1' pr='md'>
                <TextInput
                    placeholder="Поиск по названию"
                    value={nameFilter}
                    onChange={(e) => onNameFilterChange(e.target.value)}
                />
            </Box>
            <Popover position="bottom" withArrow shadow="md" closeOnClickOutside={false} opened={opened} onClose={close}>
                <Popover.Target>
                    <Burger opened={opened} onClick={toggle} aria-label="выбор сортировки"/>
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
                        {sortOptions.map(({value, label}) => (
                            <Radio
                                key={label}
                                label={label}
                                value={JSON.stringify(value)}
                            />
                        ))}
                    </Radio.Group>
                </Popover.Dropdown>
            </Popover>
        </Box>
    )
}