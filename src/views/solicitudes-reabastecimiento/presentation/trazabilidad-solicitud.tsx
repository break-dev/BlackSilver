import { Group, Stack, Text, Timeline, Paper, Loader } from "@mantine/core";
import {
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type { RES_TrazabilidadEvento } from "../services/reabastecimiento.responses";

interface TrazabilidadSolicitudProps {
  productoNombre: string;
  eventos: RES_TrazabilidadEvento[];
  loading: boolean;
}

export const TrazabilidadSolicitud = ({
  productoNombre,
  eventos,
  loading,
}: TrazabilidadSolicitudProps) => {
  return (
    <Stack gap="xl" p="xs" className="animate-fade-in">
      <Paper
        bg="indigo.9/10"
        p="md"
        radius="lg"
        className="border border-indigo-500/20"
      >
        <Stack gap={4}>
          <Text
            size="xs"
            fw={700}
            className="text-zinc-500 uppercase tracking-widest"
          >
            Seguimiento de Item
          </Text>
          <Text size="md" fw={900} className="text-white italic">
            {productoNombre}
          </Text>
        </Stack>
      </Paper>

      {loading ? (
        <Group justify="center" py="xl">
          <Loader color="indigo" size="sm" variant="dots" />
          <Text size="sm" c="zinc.5">
            Cargando historial...
          </Text>
        </Group>
      ) : eventos.length === 0 ? (
        <Paper
          p="xl"
          radius="md"
          bg="zinc.9/30"
          className="border border-zinc-800 border-dashed text-center"
        >
          <Text size="sm" c="zinc.5" fs="italic">
            No se registra trazabilidad para este item.
          </Text>
        </Paper>
      ) : (
        <Timeline
          active={eventos.length - 1}
          bulletSize={24}
          lineWidth={2}
          color="indigo"
          classNames={{
            itemBullet: "bg-zinc-900 border-zinc-800",
            itemTitle: "text-zinc-100 font-bold text-sm mb-1",
          }}
        >
          {eventos.map((ev, index) => (
            <Timeline.Item
              key={ev.id_trazabilidad}
              bullet={
                index === eventos.length - 1 ? (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ClockIcon className="w-4 h-4 text-zinc-500" />
                )
              }
              title={ev.estado}
            >
              <Stack gap={4} mt={6}>
                <Text size="xs" className="text-zinc-300">
                  {ev.descripcion}
                </Text>
                <Group gap="xs" wrap="nowrap">
                  <UserIcon className="w-3 h-3 text-zinc-500" />
                  <Text
                    size="11px"
                    fw={600}
                    className="text-zinc-500 uppercase"
                  >
                    {ev.empleado || "Sistema"}
                  </Text>
                  <Text size="11px" className="text-zinc-600 font-mono ml-auto">
                    {dayjs(ev.created_at).format("DD MMM, YYYY HH:mm")}
                  </Text>
                </Group>
              </Stack>
            </Timeline.Item>
          ))}
        </Timeline>
      )}

      <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50 mt-4">
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 animate-pulse" />
          <Text size="xs" className="text-zinc-500 font-medium italic">
            Los eventos se ordenan cronológicamente para mostrar el flujo de
            atención del producto desde su solicitud.
          </Text>
        </Group>
      </div>
    </Stack>
  );
};
