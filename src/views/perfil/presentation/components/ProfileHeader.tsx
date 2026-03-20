import { Avatar, Stack, Text, Group, Badge } from "@mantine/core";
import { UserIcon } from "@heroicons/react/24/outline";

interface ProfileHeaderProps {
  username: string;
  path_foto: string | null;
  nombre_rol: string;
  nombre_cargo?: string | null;
}

export const ProfileHeader = ({
  username,
  path_foto,
  nombre_rol,
  nombre_cargo,
}: ProfileHeaderProps) => {
  return (
    <Group gap="xl" justify="flex-start" align="center" className="w-full">
      <Avatar
        src={path_foto}
        size={90}
        radius="md"
        className="border border-zinc-800 bg-zinc-900 shadow-xl"
      >
        <UserIcon className="w-10 h-10 text-zinc-700" />
      </Avatar>
      <Stack gap={6}>
        <Text
          fw={800}
          size="lg"
          className="text-white tracking-tight"
        >
          @{username}
        </Text>
        <Group gap={8}>
          <Badge
            variant="light"
            color="indigo"
            radius="sm"
            size="sm"
            className="font-bold border border-indigo-500/20"
          >
            {nombre_rol}
          </Badge>
          {nombre_cargo && (
            <Badge
              variant="light"
              color="pink"
              radius="sm"
              size="sm"
              className="font-bold border border-pink-500/20"
            >
              {nombre_cargo}
            </Badge>
          )}
        </Group>
      </Stack>
    </Group>
  );
};
