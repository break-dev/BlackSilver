import {
  Loader,
  Paper,
  Stack,
  Text,
  Timeline,
  ThemeIcon,
  Badge,
  Group,
} from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";
import {
  getEstadoDetalleColor,
  getEstadoDetalleIcon,
} from "./utils/prestamos-render";
import type {
  Estado_PrestamoDetalle,
  Estado_PrestamoDetalleLog,
} from "../../../shared/enums/prestamo-almacen/prestamo";

interface TrazabilidadPrestamoProps {
  productoNombre: string;
  logs: RES_Trazabilidad[];
  loading: boolean;
}

export const TrazabilidadDetalle = ({
  productoNombre,
  logs,
  loading,
}: TrazabilidadPrestamoProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  return (
    <Stack gap="xl" className="animate-fade-in p-2">
      <div className="px-4 py-3 border-l-4 border-indigo-500 bg-zinc-900/50 rounded-r-xl shadow-sm">
        <Text
          size="xs"
          c="dimmed"
          fw={700}
          className="uppercase tracking-widest mb-1"
        >
          Producto:
        </Text>
        <Text size="lg" fw={800} className="text-white tracking-tight">
          {productoNombre}
        </Text>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
          <CubeIcon className="w-12 h-12 text-zinc-700 mx-auto mb-3 opacity-20" />
          <Text c="dimmed" fs="italic" size="sm">
            No hay eventos registrados para este producto.
          </Text>
        </div>
      ) : (
        <Timeline
          active={logs.length + 1}
          bulletSize={32}
          lineWidth={2}
          className="px-4"
        >
          {logs.map((log) => {
            const color = getEstadoDetalleColor(
              log.estado as Estado_PrestamoDetalle,
            );

            return (
              <Timeline.Item
                key={log.id_log}
                color={color}
                bullet={
                  <ThemeIcon
                    size={32}
                    radius="xl"
                    color={color}
                    variant="filled"
                    className="shadow-lg transform transition-transform hover:scale-110"
                  >
                    {getEstadoDetalleIcon(
                      log.estado as Estado_PrestamoDetalleLog,
                    )}
                  </ThemeIcon>
                }
                title={
                  <Group justify="space-between" align="center" mb={6}>
                    <Badge
                      color={color}
                      variant="light"
                      radius="xl"
                      size="sm"
                      className="font-bold border border-current/20 px-3 py-2"
                    >
                      {log.estado}
                    </Badge>
                    <Text size="11px" c="zinc.5" fw={700} className="font-mono">
                      {dayjs(log.created_at).format("DD/MM/YYYY HH:mm")}
                    </Text>
                  </Group>
                }
              >
                <Paper
                  p="md"
                  radius="lg"
                  className="bg-zinc-900/40 border border-zinc-800/50 shadow-sm transition-colors hover:bg-zinc-900/60"
                >
                  <Text
                    size="sm"
                    fw={500}
                    c="zinc.2"
                    className="leading-relaxed"
                  >
                    {log.descripcion}
                  </Text>
                  <div className="mt-3 pt-3 border-t border-zinc-800/50 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Text size="10px" fw={800} c="zinc.5">
                        {log.empleado?.charAt(0) || "?"}
                      </Text>
                    </div>
                    <Text size="xs" c="zinc.5" fw={500}>
                      Registrado por:
                    </Text>
                    <Text size="xs" fw={700} c="zinc.3" className="italic">
                      {log.empleado || "Sistema"}
                    </Text>
                  </div>
                </Paper>
              </Timeline.Item>
            );
          })}
        </Timeline>
      )}
    </Stack>
  );
};
