import { Stack, Skeleton, SimpleGrid, Group } from "@mantine/core";

export const ProfileSkeleton = () => {
  return (
    <Stack
      gap={45}
      className="animate-fade-in py-10 px-0 mb-20 w-full max-w-xl mx-auto"
    >
      {/* Header Skeleton */}
      <Group gap="xl" justify="flex-start" align="center" className="w-full">
        <Skeleton height={90} width={90} radius="md" />
        <Stack gap={10}>
          <Skeleton height={20} width={180} radius="sm" />
          <Group gap={8}>
            <Skeleton height={24} width={100} radius="sm" />
            <Skeleton height={24} width={100} radius="sm" />
          </Group>
        </Stack>
      </Group>

      {/* SECCIÓN PERSONAL Skeleton (7 fields) */}
      <Stack gap={20} className="w-full">
        <Group gap="md">
          <Skeleton height={14} width={150} radius="xs" />
          <div className="h-px flex-1 bg-zinc-800/20" />
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={35} className="w-full">
          {[...Array(7)].map((_, i) => (
            <Stack key={i} gap={8}>
              <Skeleton height={13} width="40%" radius="xs" />
              <div className="ml-6">
                <Skeleton height={15} width="80%" radius="xs" />
              </div>
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>

      {/* SECCIÓN LABORAL Skeleton (5 fields) */}
      <Stack gap={20} className="w-full">
        <Group gap="md">
          <Skeleton height={14} width={150} radius="xs" />
          <div className="h-px flex-1 bg-zinc-800/20" />
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={35} className="w-full">
          {[...Array(5)].map((_, i) => (
            <Stack key={i} gap={8}>
              <Skeleton height={13} width="40%" radius="xs" />
              <div className="ml-6">
                <Skeleton height={15} width="80%" radius="xs" />
              </div>
            </Stack>
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
};
