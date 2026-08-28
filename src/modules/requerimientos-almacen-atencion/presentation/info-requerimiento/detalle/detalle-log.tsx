import { Timeline, Text, Loader, Stack, Badge, Group } from "@mantine/core";
import type { RES_Trazabilidad } from "../../../../../service/responses/_generic/trazabilidad";
import { Estado_RequerimientoDetalleLog } from "../../../../../shared/enums/requerimiento-almacen/requerimiento";
import dayjs from "dayjs";

const formatFecha = (raw: string) => {
  const d = dayjs(raw);
  return d.isValid() ? d.format("DD/MM/YYYY HH:mm") : raw;
};

const getGlosaColor = (status: string) => {
  switch (status) {
    case Estado_RequerimientoDetalleLog.EsperandoAprobacion.toString():
      return "blue";
    case Estado_RequerimientoDetalleLog.Aprobado.toString():
      return "violet";
    case Estado_RequerimientoDetalleLog.Rechazado.toString():
      return "red";
    case Estado_RequerimientoDetalleLog.EnDespacho.toString():
      return "orange";
    case Estado_RequerimientoDetalleLog.NuevaEntrega.toString():
      return "green";
    case Estado_RequerimientoDetalleLog.Completado.toString():
      return "teal";
    case Estado_RequerimientoDetalleLog.ConsultaLogistica.toString():
      return "cyan";
    case Estado_RequerimientoDetalleLog.Cerrado.toString():
      return "zinc";
    default:
      return "gray";
  }
};

interface DetalleLogProps {
  loading: boolean;
  eventos: RES_Trazabilidad[];
  producto: string | null;
}

export const DetalleLog = ({ loading, eventos, producto }: DetalleLogProps) => {
  if (loading) {
    return (
      <Stack align="center" py="xl">
        <Loader size="sm" color="indigo" />
        <Text c="zinc.5" size="sm">
          Cargando trazabilidad...
        </Text>
      </Stack>
    );
  }

  if (!eventos || eventos.length === 0) {
    return (
      <Stack align="center" py="xl">
        <Text c="zinc.5" size="sm" fs="italic">
          Este ítem aún no tiene eventos de trazabilidad.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text fw={700} className="text-zinc-100 italic tracking-tight">
          Trazabilidad
        </Text>
        {producto && (
          <Badge variant="light" color="indigo" radius="md">
            {producto}
          </Badge>
        )}
      </Group>

      <Timeline active={eventos.length} bulletSize={18} lineWidth={2}>
        {eventos.map((ev) => (
          <Timeline.Item
            key={ev.id_log}
            color={getGlosaColor(ev.estado)}
            title={
              <Group gap="xs" align="center">
                <Badge
                  variant="light"
                  color={getGlosaColor(ev.estado)}
                  radius="sm"
                  size="sm"
                >
                  {ev.estado}
                </Badge>
                <Text size="xs" c="zinc.5">
                  {formatFecha(ev.created_at)}
                </Text>
              </Group>
            }
          >
            <Text size="sm" c="zinc.3" className="italic leading-tight mt-1">
              {ev.descripcion}
            </Text>
            {ev.empleado && (
              <Text size="xs" c="zinc.5" className="mt-1">
                <span className="font-bold text-zinc-400">Por:</span>{" "}
                {ev.empleado}
              </Text>
            )}
          </Timeline.Item>
        ))}
      </Timeline>
    </Stack>
  );
};
