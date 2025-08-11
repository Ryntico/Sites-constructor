import React from 'react';
import {Stack, Text, Image, ActionIcon, Box, Group} from '@mantine/core';
import { type UpdateProfileValues } from "../../hooks/useUpdateProfile.ts";

interface ProfileView {
    user: UpdateProfileValues;
    editCallback: VoidFunction
}

export const ProfileView: React.FC<ProfileView> = ({ user, editCallback }) => {
  return (
    <Stack gap="xl" align="center">
        <Box w='100%'>
            <Group justify='right'>
                <ActionIcon
                    size="lg"
                    radius="xl"
                    color="blue"
                    onClick={editCallback}
                >
                    ✏️
                </ActionIcon>
            </Group>
        </Box>

        <Box>
            <Image
              src="https://i.pinimg.com/474x/6d/a8/e6/6da8e6d1456bfb1345cfaedf4690448e.jpg"
              alt="Profile avatar"
              width={240}
              height={240}
              radius="xl"
              style={{ border: '2px solid #000' }}
            />
        </Box>

      <Stack gap="md" align="center">
        <Text size="xl" fw={600} ta="center">
            {`${user.firstName} ${user.lastName}`}
        </Text>
        <Text size="lg" c="dimmed" ta="center">
          {user.email}
        </Text>
      </Stack>
    </Stack>
  );
};
