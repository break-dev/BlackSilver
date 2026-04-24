import {
  Badge,
  Group,
  Stack,
  Table,
  Text,
  Paper,
  Loader,
  Divider,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  BuildingStorefrontIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  CubeIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  LinkIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { OrdenCompraService } from "../service/orden-compra.service";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { TrazabilidadOrdenCompra } from "./trazabilidad-orden-compra";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";

interface DetalleOrdenCompraProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  loading: boolean;
}

const STATUS_ITEM_COLORS: Record<string, string> = {
  Pendiente: "orange",
  "En Recepción": "pink",
  Recibido: "green",
  Completado: "green",
};

export const DetalleOrdenCompra = ({
  orden,
  detalles,
  loading,
}: DetalleOrdenCompraProps) => {
  const [openedSeguimiento, { open: openSeg, close: closeSeg }] =
    useDisclosure(false);
  const [selectedItem, setSelectedItem] =
    useState<RES_OrdenCompraDetalle | null>(null);
  const [logs, setLogs] = useState<RES_Trazabilidad[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="teal" size="lg" />
      </div>
    );
  }

  const handleVerSeguimiento = async (item: RES_OrdenCompraDetalle) => {
    setSelectedItem(item);
    openSeg();
    setLoadingLogs(true);
    try {
      const res = await OrdenCompraService.get_seguimiento(
        item.id_orden_compra_detalle,
      );
      if (res.success) {
        setLogs(res.data);
      }
    } catch {
      console.error("Error al cargar seguimiento");
    } finally {
      setLoadingLogs(false);
    }
  };

  const symbol = orden.moneda === "Soles" ? "S/." : "$";

  // Por ahora el progreso es simulado o basado en el estado general
  const progresoGeneral =
    orden.estado === "Completada"
      ? 100
      : orden.estado === "En Recepción"
        ? 50
        : 0;

  return (
    <Stack gap="xl" className="animate-fade-in p-1">
      {/* Header: Datos Principales en 4 columnas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Correlativo */}
        <Paper
          p="md"
          radius="lg"
          className="bg-emerald-500/5 border border-emerald-500/20 relative overflow-hidden group hover:bg-emerald-500/10 transition-all"
        >
          <CheckBadgeIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-400/10 rotate-12" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <CheckBadgeIcon className="w-4 h-4 text-emerald-400" />
              <Text
                size="xs"
                c="emerald.3"
                fw={800}
                className="uppercase tracking-widest"
              >
                Correlativo
              </Text>
            </Group>
            <Text
              size="md"
              fw={900}
              className="text-zinc-100 uppercase font-mono"
            >
              {orden.correlativo}
            </Text>
          </Stack>
        </Paper>

        {/* Empresa Compradora */}
        <Paper
          p="md"
          radius="lg"
          className="bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-500/10 transition-all"
        >
          <BuildingStorefrontIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-indigo-400/10 rotate-12" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400" />
              <Text
                size="xs"
                c="indigo.3"
                fw={800}
                className="uppercase tracking-widest"
              >
                Empresa Compradora
              </Text>
            </Group>
            <Text size="sm" fw={800} className="text-zinc-100 truncate">
              {orden.empresa}
            </Text>
          </Stack>
        </Paper>

        {/* Fecha de Emisión */}
        <Paper
          p="md"
          radius="lg"
          className="bg-zinc-800/40 border border-zinc-700/50 relative overflow-hidden group hover:bg-zinc-800/60 transition-all"
        >
          <CalendarDaysIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-zinc-400/10 rotate-12" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <CalendarDaysIcon className="w-4 h-4 text-zinc-400" />
              <Text
                size="xs"
                c="zinc.4"
                fw={800}
                className="uppercase tracking-widest"
              >
                Fecha de Emisión
              </Text>
            </Group>
            <Text size="sm" fw={800} className="text-zinc-100">
              {dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY")}
            </Text>
          </Stack>
        </Paper>

        {/* Cotización Ref. */}
        <Paper
          p="md"
          radius="lg"
          className="bg-pink-500/5 border border-pink-500/20 relative overflow-hidden group hover:bg-pink-500/10 transition-all"
        >
          <LinkIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-pink-400/10 rotate-12" />
          <Stack gap={2} className="relative z-10">
            <Group gap={6}>
              <LinkIcon className="w-4 h-4 text-pink-400" />
              <Text
                size="xs"
                c="pink.3"
                fw={800}
                className="uppercase tracking-widest"
              >
                Cotización Ref.
              </Text>
            </Group>
            <Text
              size="md"
              fw={900}
              className="text-zinc-100 uppercase font-mono"
            >
              {orden.correlativo_cotizacion}
            </Text>
          </Stack>
        </Paper>
      </div>

      {/* Barra de Progreso General (Estilo Reabastecimiento) */}
      <Paper
        p="md"
        radius="xl"
        className="bg-zinc-900/50 border border-zinc-800"
      >
        <Group justify="space-between" mb={8} px={4}>
          <Text
            size="xs"
            fw={800}
            className="text-zinc-400 tracking-tighter uppercase"
          >
            Progreso de Atención de Productos
          </Text>
          <Text size="sm" fw={900} c="emerald.4">
            {progresoGeneral}%
          </Text>
        </Group>
        <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-linear-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            style={{ width: `${progresoGeneral}%` }}
          />
        </div>
      </Paper>

      {/* Tabla de Productos con Precio */}
      <div className="space-y-4">
        <Group gap="xs" px="xs">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/10">
            <CubeIcon className="w-5 h-5 text-indigo-400" />
          </div>
          <Text
            fw={800}
            className="text-zinc-100 italic tracking-tight text-lg"
          >
            Items de la Orden de Compra
          </Text>
        </Group>

        <div className="overflow-hidden border border-zinc-800 rounded-2xl bg-zinc-950/20 shadow-2xl">
          <Table verticalSpacing="md" horizontalSpacing="xl">
            <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4 text-center w-12">#</th>
                <th className="px-6 py-4 text-left">Producto</th>
                <th className="px-6 py-4 text-center">Cantidad Solicitada</th>
                <th className="px-6 py-4 text-center">Precio Unit.</th>
                <th className="px-6 py-4 text-center">Importe</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {detalles.map((det, index) => {
                const subtotalItem =
                  det.cantidad_requerida * det.precio_unitario;
                const isDiferentUnit =
                  det.id_unidad_medida_base !== det.id_unidad_medida_oc;

                return (
                  <tr
                    key={det.id_orden_compra_detalle}
                    className="hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-zinc-500 text-xs font-mono">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <Text size="sm" fw={800} className="text-zinc-100">
                        {det.producto}
                      </Text>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Stack gap={2} align="center">
                        <Badge
                          variant="filled"
                          color="indigo"
                          radius="sm"
                          size="sm"
                          className="font-bold"
                        >
                          {formatNumber(det.cantidad_requerida)}{" "}
                          {det.unidad_medida_oc_abv}
                        </Badge>
                        {isDiferentUnit && (
                          <Text
                            size="10px"
                            c="dimmed"
                            fw={700}
                            className="italic"
                          >
                            ({formatNumber(det.contenido_por_presentacion)}{" "}
                            {det.unidad_medida_base_abv} x{" "}
                            {det.unidad_medida_oc_abv})
                          </Text>
                        )}
                      </Stack>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-zinc-400 text-xs">
                      {symbol} {formatNumber(det.precio_unitario)}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-zinc-400 text-xs">
                      {symbol} {formatNumber(subtotalItem)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant="filled"
                        color={STATUS_ITEM_COLORS[det.estado] || "gray"}
                        size="xs"
                        radius="sm"
                        className="uppercase font-bold tracking-tighter"
                      >
                        {det.estado}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Tooltip label="Ver Seguimiento" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="zinc"
                          size="md"
                          onClick={() => handleVerSeguimiento(det)}
                          className="hover:bg-zinc-800/50 transition-colors"
                        >
                          <ClockIcon className="w-4 h-4" />
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

      {/* Footer Finanaciero */}
      <Paper
        p="xl"
        radius="lg"
        className="bg-zinc-900/60 border border-zinc-800 border-t-4 border-t-emerald-500 shadow-xl"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="flex-1">
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest mb-1.5"
            >
              Notas / Observaciones
            </Text>
            <Text
              size="xs"
              className="text-zinc-500 italic max-w-lg leading-relaxed"
            >
              {orden.observacion ||
                "Sin observaciones adicionales registradas para este documento oficial de compra."}
            </Text>
          </div>

          <Stack gap={8} className="min-w-[240px]">
            <Group justify="space-between">
              <Group gap={6}>
                <BanknotesIcon className="w-3 h-3 text-zinc-500" />
                <Text size="xs" c="zinc-4" fw={700}>
                  Subtotal:
                </Text>
              </Group>
              <Text size="xs" fw={800} className="text-zinc-200">
                {symbol} {formatNumber(orden.total_antes_igv)}
              </Text>
            </Group>

            <Group justify="space-between">
              <Group gap={6}>
                <ReceiptPercentIcon className="w-3 h-3 text-indigo-400" />
                <Text size="xs" c="zinc-4" fw={700}>
                  IGV ({orden.porcentaje_igv}%):
                </Text>
              </Group>
              <Text size="xs" fw={800} className="text-zinc-200">
                {symbol} {formatNumber(orden.monto_igv)}
              </Text>
            </Group>

            <Divider color="zinc.7" variant="dashed" />

            <Group justify="space-between">
              <Text
                size="sm"
                fw={900}
                className="text-white uppercase tracking-tighter"
              >
                Total Orden:
              </Text>
              <Text
                size="md"
                fw={900}
                className="text-emerald-400 leading-none"
              >
                {symbol} {formatNumber(orden.total_despues_igv)}
              </Text>
            </Group>
          </Stack>
        </div>
      </Paper>

      {/* Modal de Seguimiento */}
      <ModalEstandar
        opened={openedSeguimiento}
        close={closeSeg}
        title="Seguimiento de tu compra"
        size="md"
      >
        <TrazabilidadOrdenCompra
          eventos={logs}
          loading={loadingLogs}
          productoNombre={selectedItem?.producto}
        />
      </ModalEstandar>
    </Stack>
  );
};
