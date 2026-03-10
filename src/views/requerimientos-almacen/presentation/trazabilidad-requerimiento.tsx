import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Timeline,
  ThemeIcon,
} from "@mantine/core";
import {
  ClipboardDocumentListIcon,
  CheckBadgeIcon,
  TruckIcon,
  ArchiveBoxArrowDownIcon,
  XCircleIcon,
  CheckCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";
import type { RES_TrazabilidadEvento } from "../services/requerimientos.responses";

interface TrazabilidadRequerimientoProps {
  productoNombre: string;
  eventos: RES_TrazabilidadEvento[];
  loading: boolean;
}

export const TrazabilidadRequerimiento = ({
  productoNombre,
  eventos,
  loading,
}: TrazabilidadRequerimientoProps) => {
  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader color="violet" />
      </div>
    );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case EstadoDetalleRequerimiento.Pendiente:
        return <ClipboardDocumentListIcon className="w-4 h-4" />;
      case EstadoDetalleRequerimiento.AprobacionLogistica:
        return <CheckBadgeIcon className="w-4 h-4" />;
      case EstadoDetalleRequerimiento.DespachoIniciado:
        return <TruckIcon className="w-4 h-4" />;
      case EstadoDetalleRequerimiento.NuevaEntrega:
        return <ArchiveBoxArrowDownIcon className="w-4 h-4" />;
      case EstadoDetalleRequerimiento.RechazadoLogistica:
        return <XCircleIcon className="w-4 h-4" />;
      case EstadoDetalleRequerimiento.Completado:
        return <CheckCircleIcon className="w-4 h-4" />;
      case EstadoDetalleRequerimiento.Cerrado:
        return <CubeIcon className="w-4 h-4" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-white" />;
    }
  };

  return (
    <Stack gap="xl" p="xs">
      <div className="px-4 py-2 border-l-4 border-indigo-500 bg-zinc-900/50 rounded-r-xl">
        <Text
          size="xs"
          c="dimmed"
          fw={700}
          className="uppercase tracking-widest"
        >
          Producto:
        </Text>
        <Text size="lg" fw={800} className="text-white tracking-tight">
          {productoNombre}
        </Text>
      </div>

      <Timeline active={eventos.length} bulletSize={32} lineWidth={2}>
        {eventos.map((ev) => (
          <Timeline.Item
            key={ev.id_trazabilidad}
            bullet={
              <ThemeIcon size={32} radius="xl" color="indigo">
                {getStatusIcon(ev.estado)}
              </ThemeIcon>
            }
            title={
              <Group justify="space-between">
                <Badge size="sm" variant="light" color="indigo">
                  {ev.estado}
                </Badge>
                <Text size="11px" c="dimmed">
                  {dayjs(ev.created_at).format("DD/MM/YYYY HH:mm")}
                </Text>
              </Group>
            }
          >
            <Paper
              p="sm"
              className="bg-zinc-900/30 border border-zinc-800 mt-2"
            >
              <Text size="sm">{ev.descripcion}</Text>
              <Text size="xs" c="dimmed" mt={4} fw={700}>
                Por: {ev.empleado}
              </Text>
            </Paper>
          </Timeline.Item>
        ))}
      </Timeline>
    </Stack>
  );
};
