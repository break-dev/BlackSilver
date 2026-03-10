import { Stack, Text, Paper, Group, Loader, Badge } from "@mantine/core";
import { MapPinIcon } from "@heroicons/react/24/outline";
import type { RES_LaborRelacionada } from "../services/requerimientos.responses";

interface LaboresRequerimientoProps {
  labores: RES_LaborRelacionada[];
  loading: boolean;
}

export const LaboresRequerimiento = ({
  labores,
  loading,
}: LaboresRequerimientoProps) => {
  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader color="violet" />
      </div>
    );
  }

  if (labores.length === 0) {
    return (
      <Paper
        p="xl"
        radius="lg"
        className="bg-zinc-900/40 border border-zinc-800"
      >
        <Stack align="center" gap="xs">
          <MapPinIcon className="w-10 h-10 text-zinc-600" />
          <Text c="dimmed" fw={600}>
            No hay labores registradas para este requerimiento.
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <div className="grid grid-cols-1 gap-4">
        {labores.map((labor) => (
          <Paper
            key={labor.id_labor}
            p="md"
            radius="lg"
            className="bg-zinc-900/50 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
          >
            <Group justify="space-between" align="start">
              <Group gap="md" align="start" wrap="nowrap">
                <div className="p-2 rounded-lg bg-indigo-500/10 shrink-0">
                  <MapPinIcon className="w-6 h-6 text-indigo-500" />
                </div>
                <Stack gap={4}>
                  <Group gap="xs">
                    <Badge
                      variant="filled"
                      color="indigo"
                      radius="sm"
                      size="sm"
                    >
                      {labor.correlativo}
                    </Badge>
                    <Text fw={800} size="lg" className="text-white">
                      {labor.nombre}
                    </Text>
                  </Group>
                  <Text size="sm" c="dimmed" className="line-clamp-2 italic">
                    {labor.descripcion || "Sin descripción adicional"}
                  </Text>
                </Stack>
              </Group>
              <Badge
                variant="light"
                color="indigo"
                radius="sm"
                className="shrink-0"
              >
                Labor Involucrada
              </Badge>
            </Group>
          </Paper>
        ))}
      </div>
    </Stack>
  );
};
