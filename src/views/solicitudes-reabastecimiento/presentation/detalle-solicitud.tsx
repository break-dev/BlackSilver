import { Badge, Group, Loader, Paper, Stack, Table, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import {
  ClockIcon,
  CubeIcon,
  ListBulletIcon,
  UserIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

import { useSolicitudesReabastecimiento } from "../../../../services/solicitudes-reabastecimiento/useSolicitudesReabastecimiento";
import type {
  RES_SolicitudReabastecimiento,
  RES_SolicitudReabastecimientoDetalle,
} from "../../service/solicitudes-reabastecimiento.requests";

interface DetalleSolicitudReabastecimientoProps {
  solicitud: RES_SolicitudReabastecimiento;
}

export const DetalleSolicitudReabastecimiento = ({
  solicitud,
}: DetalleSolicitudReabastecimientoProps) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RES_SolicitudReabastecimientoDetalle[]>(
    [],
  );
  const [, setError] = useState("");

  const { obtenerDetallesSoloLista } = useSolicitudesReabastecimiento({
    setError,
  });

  useEffect(() => {
    setLoading(true);
    obtenerDetallesSoloLista(solicitud.id_solicitud_reabastecimiento)
      .then((res) => setItems(res ?? []))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitud.id_solicitud_reabastecimiento]);

  return (
    <Stack gap="xl" className="animate-fade-in">
      {/* Header: Datos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
        <Paper
          p="md"
          radius="lg"
          className="bg-indigo-500/6 border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-500/10 transition-all"
        >
          <UserIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-indigo-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <UserIcon className="w-4 h-4 text-indigo-400" />
              <Text
                size="xs"
                c="indigo.3"
                fw={800}
                className="uppercase tracking-widest"
              >
                Solicitante
              </Text>
            </Group>
            <Text
              size="md"
              fw={900}
              className="text-white tracking-tight leading-tight"
            >
              {solicitud.empleado_solicitante}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-violet-500/6 border border-violet-500/20 relative overflow-hidden group hover:bg-violet-500/10 transition-all"
        >
          <CheckBadgeIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-violet-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <CheckBadgeIcon className="w-4 h-4 text-violet-400" />
              <Text
                size="xs"
                c="violet.3"
                fw={800}
                className="uppercase tracking-widest"
              >
                Correlativo
              </Text>
            </Group>
            <Text
              size="md"
              fw={900}
              className="text-zinc-100 tracking-tight leading-tight"
            >
              {solicitud.correlativo}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-emerald-500/6 border border-emerald-500/20 relative overflow-hidden group hover:bg-emerald-500/10 transition-all"
        >
          <BuildingStorefrontIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <BuildingStorefrontIcon className="w-4 h-4 text-emerald-500" />
              <Text
                size="xs"
                c="emerald.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Almacén Solicitante
              </Text>
            </Group>
            <Text
              size="md"
              fw={800}
              className="text-zinc-100 tracking-tight leading-tight italic"
            >
              {solicitud.almacen_solicitante}
            </Text>
          </Stack>
        </Paper>
      </div>

      {/* Sub-header: Estados, Fechas */}
      <Paper
        p="md"
        radius="lg"
        bg="transparent"
        className="border border-zinc-800/50 mx-2"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Stack gap={4}>
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Prioridad
            </Text>
            <Badge
              color="orange"
              variant="light"
              size="sm"
              radius="sm"
              className="border border-orange-900/30 font-bold"
            >
              {solicitud.premura}
            </Badge>
          </Stack>

          <Stack gap={4}>
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Estado
            </Text>
            <Badge
              color="green"
              variant="light"
              size="sm"
              radius="sm"
              className="border border-green-900/30 font-bold"
            >
              {solicitud.estado}
            </Badge>
          </Stack>

          <Stack gap={4}>
            <div className="flex items-center gap-1.5 font-bold">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-rose-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Fecha Requerida
              </Text>
            </div>
            <Text size="sm" fw={800} className="text-zinc-100 italic">
              {solicitud.fecha_hora_entrega_requerida
                ? dayjs(solicitud.fecha_hora_entrega_requerida).format(
                    "DD/MM/YYYY",
                  )
                : "No especificada"}
            </Text>
          </Stack>

          <Stack gap={4}>
            <div className="flex items-center gap-1.5 font-bold">
              <ClockIcon className="w-3.5 h-3.5 text-zinc-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Fecha de Registro
              </Text>
            </div>
            <Text size="sm" fw={400} className="text-zinc-400 font-mono">
              {dayjs(solicitud.created_at).format("DD/MM/YYYY HH:mm")}
            </Text>
          </Stack>
        </div>
      </Paper>

      {/* Tabla de Items */}
      <div className="space-y-4">
        <Group justify="space-between" align="center" px={4}>
          <Group gap="xs">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg shadow-sm border border-indigo-500/10">
              <ListBulletIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <Text
              fw={800}
              className="text-zinc-100 italic tracking-tight text-lg"
            >
              Items Solicitados
            </Text>
          </Group>
          <Badge
            variant="light"
            color="indigo"
            radius="md"
            size="sm"
            className="font-bold py-3 px-4 uppercase tracking-widest"
          >
            {items.length} {items.length === 1 ? "Producto" : "Productos"}
          </Badge>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader color="violet" size="md" />
            </div>
          ) : (
            <Table
              verticalSpacing="md"
              horizontalSpacing="xl"
              className="min-w-[800px]"
            >
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center w-12">#</th>
                  <th className="px-6 py-4 text-left">Producto</th>
                  <th className="px-6 py-4 text-right">Cant. Solic.</th>
                  <th className="px-6 py-4 text-center">Equivalencia</th>
                  <th className="px-6 py-4 text-left">Comentario</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-zinc-500 italic"
                    >
                      No hay detalles registrados
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-zinc-900/40 transition-colors group"
                    >
                      <td className="px-6 py-4 text-center text-zinc-500 text-xs font-mono">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <Group gap="sm">
                          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-sm group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all duration-300">
                            <CubeIcon className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                          </div>
                          <Text
                            size="sm"
                            fw={800}
                            className="text-zinc-100 group-hover:text-white transition-colors tracking-tight"
                          >
                            {(item as any).producto_nombre ??
                              (item as any).producto}
                          </Text>
                        </Group>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Badge
                          variant="filled"
                          color="cyan"
                          radius="sm"
                          className="font-bold shadow-xs whitespace-nowrap"
                        >
                          {Number(item.cantidad_solicitada || 0).toFixed(2)}{" "}
                          {(item as any).unidad_medida_abreviatura ??
                            (item as any).unidad_medida}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="filled"
                          color="pink"
                          radius="sm"
                          className="font-bold shadow-xs whitespace-nowrap"
                        >
                          {Number(item.cantidad_solicitada_base || 0).toFixed(
                            2,
                          )}{" "}
                          {(item as any).unidad_medida_base_abreviatura ??
                            "Ud. Base"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Text
                          size="xs"
                          c="zinc.5"
                          className="max-w-[220px] italic leading-tight group-hover:text-zinc-300 transition-colors"
                        >
                          {item.comentario || (
                            <span className="text-zinc-800/50">
                              Sin observaciones
                            </span>
                          )}
                        </Text>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          color={getStatusColor(item.estado)}
                          variant="light"
                          size="sm"
                          radius="md"
                          className="font-bold px-3 py-2.5"
                        >
                          {item.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    </Stack>
  );
};

const getStatusColor = (status: string) => {
  switch (status?.toUpperCase()) {
    case "PENDIENTE":
      return "blue";
    case "EN PROCESO":
      return "violet";
    case "ATENDIDO":
      return "green";
    case "RECHAZADO":
      return "red";
    case "COMPLETADO":
      return "cyan";
    case "CERRADO":
      return "dark";
    default:
      return "gray";
  }
};
