import React, { useEffect, useState } from "react";
import { Button, Card, Text, Group, Center, Box, Skeleton } from '@mantine/core';
import { RenderTree } from '@/components/constructor/render/Renderer';
import type { PageSchema, ThemeTokens } from '@/types/siteTypes';

interface BlockCardProps {
    block: {
        id: string;
        name: string;
        homePage?: {
            schema: PageSchema;
            theme: ThemeTokens;
        } | null;
    };
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({ block, onDelete, onEdit }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [previewError, setPreviewError] = useState<string | null>(null);

    const handlerEdit = () => onEdit(block.id);
    const handlerDelete = () => onDelete(block.id);

    useEffect(() => {
        setIsLoading(true);
        setPreviewError(null);
    }, [block.id]);

    return (
        <Card shadow="sm" padding="md" radius="md" miw={300} maw={400} withBorder>
            <Box
                style={{
                    height: 200,
                    overflow: 'hidden',
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    position: 'relative',
                    backgroundColor: '#f8f9fa',
                }}
            >
                {isLoading && !previewError && (
                    <Skeleton height="100%" width="100%" />
                )}

                {previewError && (
                    <Center h="100%" style={{ flexDirection: 'column', gap: '0.5rem' }}>
                        <Text c="dimmed" size="sm" ta="center">
                            Не удалось загрузить превью
                        </Text>
                        <Text c="dimmed" size="xs" ta="center">
                            {previewError}
                        </Text>
                    </Center>
                )}

                {block.homePage?.schema ? (
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
                        onLoadStart={() => setIsLoading(true)}
                        onLoad={() => setIsLoading(false)}
                        onError={(e) => {
                            console.error('Error rendering preview:', e);
                            setPreviewError('Ошибка отображения превью');
                            setIsLoading(false);
                        }}
                    >
                        <RenderTree
                            schema={block.homePage.schema}
                            theme={block.homePage.theme}
                        />
                    </div>
                ) : !previewError && !isLoading && (
                    <Center h="100%">
                        <Text c="dimmed" size="sm">
                            Нет превью
                        </Text>
                    </Center>
                )}
            </Box>

            <Text fw={500} size="lg" mb="xs" truncate>
                {block.name}
            </Text>

            <Group mt="md" justify="space-evenly">
                <Button onClick={handlerEdit} variant="light" w={100}>
                    Edit
                </Button>
                <Button color="red" onClick={handlerDelete} variant="light" w={100}>
                    Delete
                </Button>
            </Group>
        </Card>
    );
};