import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  ClockIcon,
  CubeIcon,
  ListBulletIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";

import { EstadoDetalleRequerimiento } from "../../../shared/enums/estados";
import type {
  RES_RequerimientoAlmacen,
  RES_RequerimientoDetalle,
  RES_LaborRelacionada,
} from "../services/requerimientos.responses";

interface DetalleRequerimientoProps {
  headerData: RES_RequerimientoAlmacen;
  detalles: RES_RequerimientoDetalle[];
  laboresVinculadas: RES_LaborRelacionada[];
  loading: boolean;
  onOpenTrazabilidad: (detalle: RES_RequerimientoDetalle) => void;
}

export const DetalleRequerimiento = ({
  headerData,
  detalles,
  laboresVinculadas,
  loading,
  onOpenTrazabilidad,
}: DetalleRequerimientoProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case EstadoDetalleRequerimiento.Pendiente:
        return "blue";
      case EstadoDetalleRequerimiento.AprobacionLogistica:
        return "violet";
      case EstadoDetalleRequerimiento.DespachoIniciado:
        return "orange";
      case EstadoDetalleRequerimiento.NuevaEntrega:
        return "green";
      case EstadoDetalleRequerimiento.RechazadoLogistica:
        return "red";
      case EstadoDetalleRequerimiento.Completado:
        return "cyan";
      case EstadoDetalleRequerimiento.Cerrado:
        return "dark";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="violet" size="lg" />
      </div>
    );
  }

  return (
    <Stack gap="xl" className="animate-fade-in">
      {/* Header: Datos Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
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
              {headerData.correlativo}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-amber-500/6 border border-amber-500/20 relative overflow-hidden group hover:bg-amber-500/10 transition-all"
        >
          <MapPinIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <MapPinIcon className="w-4 h-4 text-amber-500" />
              <Text
                size="xs"
                c="amber.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Mina
              </Text>
            </Group>
            <Text
              size="md"
              fw={800}
              className="text-zinc-100 tracking-tight leading-tight"
            >
              {headerData.mina}
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
                Almacén Destino
              </Text>
            </Group>
            <Text
              size="md"
              fw={800}
              className="text-zinc-100 tracking-tight leading-tight italic"
            >
              {headerData.almacen_destino}
            </Text>
          </Stack>
        </Paper>

        <Paper
          p="md"
          radius="lg"
          className="bg-zinc-500/6 border border-zinc-500/20 relative overflow-hidden group hover:bg-zinc-500/10 transition-all"
        >
          <ClockIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-zinc-400/10 rotate-12 group-hover:scale-110 transition-transform" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <ClockIcon className="w-4 h-4 text-zinc-500" />
              <Text
                size="xs"
                c="zinc.5"
                fw={800}
                className="uppercase tracking-widest"
              >
                Fecha Requerida
              </Text>
            </Group>
            <Text
              size="md"
              fw={800}
              className="text-zinc-100 tracking-tight leading-tight font-mono"
            >
              {headerData.fecha_entrega_requerida
                ? dayjs(headerData.fecha_entrega_requerida).format("DD/MM/YYYY")
                : "No especificada"}
            </Text>
          </Stack>
        </Paper>
      </div>

      {/* Sub-header: Estados, Fechas y Labores */}
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
              {headerData.premura}
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
              {headerData.estado}
            </Badge>
          </Stack>

          <Stack gap={4} className="lg:col-span-1">
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Labores Destino
            </Text>
            <Group gap={4}>
              {laboresVinculadas && laboresVinculadas.length > 0 ? (
                laboresVinculadas.map((l) => (
                  <Badge
                    key={l.id_labor}
                    variant="outline"
                    color="indigo"
                    size="sm"
                  >
                    ({l.correlativo}) {l.nombre}
                  </Badge>
                ))
              ) : (
                <Text size="xs" c="zinc.6" fs="italic">
                  Sin labores asignadas
                </Text>
              )}
            </Group>
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
                Feccha de Registro
              </Text>
            </div>
            <Text size="sm" fw={800} className="text-zinc-100 italic">
              {dayjs(headerData.created_at).format("DD/MM/YYYY")}
            </Text>
          </Stack>
        </div>
      </Paper>

      {/* Tabla de Items Solicitados */}
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
            {detalles.length} {detalles.length === 1 ? "Producto" : "Productos"}
          </Badge>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20">
          <Table verticalSpacing="md" horizontalSpacing="xl">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">#</th>
                <th className="px-6 py-4 text-left">Producto</th>
                <th className="px-6 py-4 text-right">Cant. Solic.</th>
                <th className="px-6 py-4 text-center w-40">Progreso</th>
                <th className="px-6 py-4 text-center">Equivalencia</th>
                <th className="px-6 py-4 text-left">Comentario</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center w-20">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {detalles.map((item, index) => {
                const solicitadoBase = Number(
                  item.cantidad_solicitada_base || 1,
                );
                const atendidoBase = Number(item.cantidad_entregada_base || 0);
                const progresoItem = Math.min(
                  100,
                  Math.round((atendidoBase / solicitadoBase) * 100),
                );

                return (
                  <tr
                    key={item.id_requerimiento_almacen_detalle}
                    className="hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-zinc-500 text-xs font-mono">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4">
                      <Group gap="sm">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-sm group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all duration-300">
                          <CubeIcon className="w-4.5 h-4.5 text-zinc-400 group-hover:text-indigo-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <Text
                          size="sm"
                          fw={800}
                          className="text-zinc-100 group-hover:text-white transition-colors tracking-tight"
                        >
                          {item.producto}
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
                        {Number(item.cantidad_solicitada || 0).toFixed(0)}{" "}
                        {item.unidad_medida}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex justify-between items-center px-1 gap-2">
                          <Text
                            size="11px"
                            fw={800}
                            c="zinc-5"
                            className="flex flex-row gap-0.5"
                          >
                            <span>Atendido: </span>
                            <span>
                              {Number(item.cantidad_entregada || 0).toFixed(0)}
                            </span>
                            <span>{item.unidad_medida}</span>
                          </Text>
                          <Text size="11px" fw={900} c="indigo.4">
                            {progresoItem}%
                          </Text>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/30">
                          <div
                            className="h-full bg-linear-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)] transition-all duration-700"
                            style={{ width: `${progresoItem}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant="filled"
                        color="pink"
                        radius="sm"
                        className="font-bold shadow-xs whitespace-nowrap"
                      >
                        {Number(item.cantidad_solicitada_base || 0).toFixed(0)}{" "}
                        {item.unidad_medida_base}
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
                    <td className="px-6 py-4 text-center">
                      <Tooltip
                        label="Ver seguimiento"
                        position="top"
                        withArrow
                        radius="md"
                      >
                        <ActionIcon
                          variant="filled"
                          color="indigo"
                          radius="md"
                          onClick={() => onOpenTrazabilidad(item)}
                          className="shadow-md hover:scale-105 transition-transform"
                        >
                          <ClockIcon className="w-4 h-4 text-white" />
                        </ActionIcon>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Stack>
  );
};
