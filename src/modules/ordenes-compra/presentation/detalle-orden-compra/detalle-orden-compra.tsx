import {
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  ActionIcon,
  Button,
  Checkbox,
} from "@mantine/core";
import {
  ClockIcon,
  CubeIcon,
  ListBulletIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  UserIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ArchiveBoxArrowDownIcon,
  ClockIcon as HistoryIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useState } from "react";
import QRCode from "qrcode";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../../service/responses/ordenes-compra/orden-compra";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar.tsx";
import { RegistroRecepcionOC } from "../registro-recepcion/registrar-recepcion-oc.tsx";
import { HistorialRecepcionesOC } from "../historial-recepciones-oc.tsx";
import { TrazabilidadDetalleOC } from "../trazabilidad-detalle-oc.tsx";
import type { RES_TicketLote } from "../../../../service/responses/lote-producto.ts";
import { usePrint } from "../../../../hooks/usePrint.ts";
import { TicketLotePDF } from "../../../../presentation/utils/ticket-lote-pdf.tsx";
import { Estado_OrdenCompraDetalle } from "../../../../shared/enums/orden-compra/orden-compra.ts";

interface DetalleOrdenCompraProps {
  orden: RES_OrdenCompra;
  detalles: RES_OrdenCompraDetalle[];
  loading: boolean;
  progresoGeneral?: number;
  onSuccess?: () => void;
}

export const DetalleOrdenCompra = ({
  orden,
  detalles,
  loading,
  progresoGeneral: propProgreso,
  onSuccess,
}: DetalleOrdenCompraProps) => {
  const [openedRecepcion, setOpenedRecepcion] = useState(false);
  const [openedHistorial, setOpenedHistorial] = useState(false);
  const [openedTrace, setOpenedTrace] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { print } = usePrint();

  const openTrace = (idDetalle: number, nombre: string) => {
    setSelectedItemId(idDetalle);
    setSelectedItemName(nombre);
    setOpenedTrace(true);
  };

  const closeTrace = () => {
    setSelectedItemId(null);
    setSelectedItemName("");
    setOpenedTrace(false);
  };

  const detallesDisponibles = detalles.filter((d) => {
    const req = Number(d.cantidad_requerida_base) || 0;
    const rec = Number(d.cantidad_recepcionada_base) || 0;
    return rec < req - 0.001;
  });

  const allAvailableSelected =
    detallesDisponibles.length > 0 &&
    selectedIds.length === detallesDisponibles.length;

  const someAvailableSelected =
    selectedIds.length > 0 && selectedIds.length < detallesDisponibles.length;

  const handleSelectAll = () => {
    if (allAvailableSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(detallesDisponibles.map((d) => d.id_orden_compra_detalle));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Cálculo interno del progreso si no se recibe por props
  const progresoGeneral =
    propProgreso ??
    (detalles.length > 0
      ? Math.min(
          100,
          Math.round(
            detalles.reduce((acc, d) => {
              const req = Number(d.cantidad_requerida_base) || 1;
              const rec = Number(d.cantidad_recepcionada_base) || 0;
              return acc + (rec / req) * 100;
            }, 0) / detalles.length,
          ),
        )
      : 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  const symbol = orden.moneda === "Soles" ? "S/." : "$";

  return (
    <Stack gap="xl" className="animate-fade-in pb-10">
      <div className="flex flex-col gap-5">
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
                  Cód. Orden
                </Text>
              </Group>
              <Text
                size="md"
                fw={900}
                className="text-zinc-100 tracking-tight leading-tight font-mono"
              >
                {orden.correlativo}
              </Text>
            </Stack>
          </Paper>

          <Paper
            p="md"
            radius="lg"
            className="bg-indigo-500/6 border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-500/10 transition-all"
          >
            <BuildingStorefrontIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-indigo-400/10 rotate-12 group-hover:scale-110 transition-transform" />
            <Stack gap={2} className="relative z-10">
              <Group gap={6}>
                <BuildingStorefrontIcon className="w-4 h-4 text-indigo-500" />
                <Text
                  size="xs"
                  c="indigo.5"
                  fw={800}
                  className="uppercase tracking-widest"
                >
                  Entidad Emisora
                </Text>
              </Group>
              <Text
                size="sm"
                fw={800}
                className="text-zinc-100 tracking-tight leading-tight line-clamp-1"
              >
                {orden.empresa}
              </Text>
            </Stack>
          </Paper>

          <Paper
            p="md"
            radius="lg"
            className="bg-amber-500/6 border border-amber-500/20 relative overflow-hidden group hover:bg-amber-500/10 transition-all"
          >
            <UserIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-400/10 rotate-12 group-hover:scale-110 transition-transform" />
            <Stack gap={2} className="relative z-10">
              <Group gap={6}>
                <UserIcon className="w-4 h-4 text-amber-500" />
                <Text
                  size="xs"
                  c="amber.5"
                  fw={800}
                  className="uppercase tracking-widest"
                >
                  Proveedor
                </Text>
              </Group>
              <Text
                size="sm"
                fw={800}
                className="text-zinc-100 tracking-tight leading-tight line-clamp-1"
              >
                {orden.proveedor}
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
                  Fecha Emisión
                </Text>
              </Group>
              <Text
                size="md"
                fw={800}
                className="text-zinc-100 tracking-tight leading-tight font-mono"
              >
                {dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY")}
              </Text>
            </Stack>
          </Paper>
        </div>

        {/* Sub-header: Estados y Condiciones */}
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
                Estado de Orden
              </Text>
              <Badge
                color="indigo"
                variant="light"
                size="sm"
                radius="sm"
                className="font-bold border border-indigo-900/30"
              >
                {orden.estado}
              </Badge>
            </Stack>

            <Stack gap={4}>
              <Group gap={6}>
                <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500" />
                <Text
                  size="xs"
                  c="zinc.5"
                  fw={800}
                  className="uppercase tracking-widest"
                >
                  Forma de Pago
                </Text>
              </Group>
              <Text size="sm" fw={800} className="text-zinc-100 italic">
                {orden.metodo_pago}
              </Text>
            </Stack>

            <Stack gap={4}>
              <Group gap={6}>
                <CurrencyDollarIcon className="w-3.5 h-3.5 text-cyan-500" />
                <Text
                  size="xs"
                  c="zinc.5"
                  fw={800}
                  className="uppercase tracking-widest"
                >
                  Moneda
                </Text>
              </Group>
              <Text size="sm" fw={800} className="text-zinc-100 italic">
                {orden.moneda}
              </Text>
            </Stack>

            <Stack gap={4}>
              <Group gap={6}>
                <DocumentTextIcon className="w-3.5 h-3.5 text-amber-500" />
                <Text
                  size="xs"
                  c="zinc.5"
                  fw={800}
                  className="uppercase tracking-widest"
                >
                  Referencia
                </Text>
              </Group>
              <Badge variant="light" color="amber" radius="sm" size="xs">
                {orden.correlativo_cotizacion || "Sin Ref."}
              </Badge>
            </Stack>
          </div>
        </Paper>

        {/* Resumen Financiero y Observaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 px-2">
          <div className="lg:col-span-8 flex flex-col gap-2">
            <Paper
              p="xs"
              radius="md"
              className="bg-zinc-950/20 border border-zinc-800/50 flex-1"
            >
              <Group gap={4} mb={2}>
                <InformationCircleIcon className="w-3.5 h-3.5 text-zinc-500" />
                <Text
                  size="10px"
                  fw={800}
                  c="zinc.5"
                  className="uppercase tracking-widest"
                >
                  Observaciones
                </Text>
              </Group>
              <Text size="xs" c="zinc.4" className="italic leading-tight">
                {orden.observacion || "Sin observaciones adicionales."}
              </Text>
            </Paper>

            {(Number(orden.costo_flete) > 0 ||
              Number(orden.otros_gastos) > 0) && (
              <Paper
                p="xs"
                radius="md"
                className="bg-zinc-950/20 border border-zinc-800/50"
              >
                <div className="flex gap-10 px-1">
                  <Group gap={4}>
                    <Text size="9px" c="zinc.6" fw={700} className="uppercase">
                      Flete:
                    </Text>
                    <Text size="xs" fw={800} className="text-zinc-300">
                      {symbol} {formatNumber(orden.costo_flete)}
                    </Text>
                  </Group>
                  <Group gap={4}>
                    <Text size="9px" c="zinc.6" fw={700} className="uppercase">
                      Otros:
                    </Text>
                    <Text size="xs" fw={800} className="text-zinc-300">
                      {symbol} {formatNumber(orden.otros_gastos)}
                    </Text>
                  </Group>
                </div>
              </Paper>
            )}
          </div>

          <Paper
            p="sm"
            radius="lg"
            className="lg:col-span-4 bg-indigo-500/5 border border-indigo-500/20"
          >
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="10px" c="zinc.5" fw={700} className="uppercase">
                  Subtotal
                </Text>
                <Text size="xs" fw={700} className="text-zinc-200 font-mono">
                  {symbol} {formatNumber(orden.total_antes_igv)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="10px" c="zinc.5" fw={700} className="uppercase">
                  IGV ({orden.porcentaje_igv}%)
                </Text>
                <Text size="xs" fw={700} className="text-zinc-200 font-mono">
                  {symbol} {formatNumber(orden.monto_igv)}
                </Text>
              </Group>
              <Group
                justify="space-between"
                className="border-t border-indigo-500/20 pt-1 mt-1"
              >
                <Text size="10px" fw={900} c="indigo.4" className="uppercase">
                  Total
                </Text>
                <Text
                  size="lg"
                  fw={900}
                  className="text-white font-mono leading-none"
                >
                  {symbol} {formatNumber(orden.total_despues_igv)}
                </Text>
              </Group>
            </Stack>
          </Paper>
        </div>

        {/* Barra de Progreso Minimalista */}
        <div className="px-2">
          <div className="bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-lg">
            <div className="flex justify-between items-center mb-1 px-4">
              <Text
                size="xs"
                fw={800}
                c="zinc.5"
                className="uppercase tracking-tighter"
              >
                Progreso de Recepción
              </Text>
              <Text size="xs" fw={900} c="indigo.4">
                {progresoGeneral}%
              </Text>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-1000"
                style={{ width: `${progresoGeneral}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabla de Items */}
        <div className="space-y-4 px-2">
          <Group justify="space-between" align="center" px={4}>
            <Group gap="xs">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                <ListBulletIcon className="w-5 h-5 text-indigo-400" />
              </div>
              <Text
                fw={800}
                className="text-zinc-100 italic tracking-tight text-lg"
              >
                Detalle de Productos
              </Text>
            </Group>
            <Group gap="xs">
              <Button
                variant="light"
                color="zinc"
                size="xs"
                radius="xl"
                leftSection={<HistoryIcon className="w-4 h-4" />}
                className="font-bold border border-zinc-800"
                onClick={() => setOpenedHistorial(true)}
              >
                Historial de Recepciones
              </Button>
              {detallesDisponibles.length > 0 && (
                <Button
                  variant="gradient"
                  gradient={{ from: "indigo.6", to: "cyan.6" }}
                  size="xs"
                  radius="xl"
                  leftSection={<ArchiveBoxArrowDownIcon className="w-4 h-4" />}
                  className="font-bold shadow-lg shadow-indigo-500/20"
                  onClick={() => setOpenedRecepcion(true)}
                  disabled={
                    selectedIds.length === 0 || orden.estado === "Completada"
                  }
                >
                  Nueva Recepción
                </Button>
              )}
              <Badge
                variant="light"
                color="indigo"
                radius="md"
                size="sm"
                className="font-bold py-3 px-4 uppercase tracking-widest"
              >
                {detalles.length}{" "}
                {detalles.length === 1 ? "Producto" : "Productos"}
              </Badge>
            </Group>
          </Group>

          <div className="overflow-hidden border border-zinc-800 rounded-2xl shadow-2xl bg-zinc-950/20">
            <Table verticalSpacing="md" horizontalSpacing="xl">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center w-12">#</th>
                  <th className="px-6 py-4 text-center w-12">
                    <Checkbox
                      checked={allAvailableSelected}
                      indeterminate={someAvailableSelected}
                      onChange={handleSelectAll}
                      color="indigo"
                      size="xs"
                      disabled={detallesDisponibles.length === 0}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left">Producto</th>
                  <th className="px-6 py-4 text-center">Cant. Solicitada</th>
                  <th className="px-6 py-4 text-center">Almacén/Entrega</th>
                  <th className="px-6 py-4 text-center">Costo Unit.</th>
                  <th className="px-6 py-4 text-center">Subtotal</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center w-16">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {detalles.map((det, idx) => {
                  const req = Number(det.cantidad_requerida_base) || 0;
                  const rec = Number(det.cantidad_recepcionada_base) || 0;
                  const isAvailable = rec < req - 0.001;
                  const isSelected = selectedIds.includes(
                    det.id_orden_compra_detalle,
                  );

                  return (
                    <tr
                      key={det.id_orden_compra_detalle}
                      className={`hover:bg-zinc-900/40 transition-colors group ${isSelected ? "bg-indigo-500/5" : ""}`}
                    >
                      <td className="px-6 py-4 text-center text-xs font-mono text-zinc-500">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Checkbox
                          checked={isSelected}
                          onChange={() =>
                            handleSelectOne(det.id_orden_compra_detalle)
                          }
                          disabled={!isAvailable}
                          color="indigo"
                          size="sm"
                          className={
                            isAvailable ? "cursor-pointer" : "opacity-40"
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Stack gap={4}>
                          <Group gap="sm">
                            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-indigo-500/50 transition-all">
                              <CubeIcon className="w-4 h-4 text-zinc-400" />
                            </div>
                            <Text
                              size="sm"
                              fw={800}
                              className="text-zinc-100 tracking-tight"
                            >
                              {det.producto}
                            </Text>
                          </Group>
                          <Group gap={4}>
                            {det.es_fiscalizado && (
                              <Badge
                                variant="filled"
                                color="red"
                                size="9px"
                                radius="xs"
                                className="font-black py-1.5!"
                              >
                                FISCALIZADO
                              </Badge>
                            )}
                            {det.es_perecible && (
                              <Badge
                                variant="filled"
                                color="orange"
                                size="9px"
                                radius="xs"
                                className="font-black py-1.5!"
                              >
                                PERECIBLE
                              </Badge>
                            )}
                          </Group>
                        </Stack>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Stack gap={0} align="center">
                          <Text size="sm" fw={800} className="text-zinc-100">
                            {formatNumber(det.cantidad_requerida)}{" "}
                            {det.unidad_medida_oc_abv}
                          </Text>
                          {det.id_unidad_medida_base !==
                            det.id_unidad_medida_oc && (
                            <Text size="10px" c="zinc.5" fw={700}>
                              Equiv:{" "}
                              {det.contenido_por_presentacion *
                                det.cantidad_requerida}{" "}
                              {det.unidad_medida_base_abv}
                            </Text>
                          )}
                        </Stack>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Stack gap={0} align="center">
                          <Badge
                            size="xs"
                            fw={700}
                            variant="outline"
                            color="green.5"
                            className="italic line-clamp-1"
                          >
                            {det.almacen_recepcionista}
                          </Badge>
                          <Group gap={4} mt={4} justify="center">
                            <Badge
                              color="blue"
                              variant="light"
                              size="xs"
                              radius="xs"
                              className="px-1!"
                            >
                              {det.tipo_despacho}
                            </Badge>
                            <Text size="xs" c="zinc.5" fw={600}>
                              {det.tiempo_entrega} {det.tiempo_entrega_periodo}
                            </Text>
                          </Group>
                          {det.lugar_recojo && (
                            <Text
                              size="xs"
                              c="zinc.5"
                              mt={2}
                              className="line-clamp-1"
                              title={det.lugar_recojo}
                            >
                              Recojo: {det.lugar_recojo}
                            </Text>
                          )}
                        </Stack>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Text
                          size="sm"
                          fw={800}
                          className="text-zinc-100 font-mono"
                        >
                          {symbol} {formatNumber(det.precio_unitario)}
                        </Text>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Text
                          size="sm"
                          fw={900}
                          className="text-zinc-100 font-mono"
                        >
                          {symbol}{" "}
                          {formatNumber(
                            det.precio_unitario * det.cantidad_requerida,
                          )}
                        </Text>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="light"
                          color={
                            det.estado ===
                            Estado_OrdenCompraDetalle.RecepcionCompleta
                              ? "teal"
                              : det.estado ===
                                  Estado_OrdenCompraDetalle.EnRecepcion
                                ? "indigo"
                                : "zinc"
                          }
                          size="xs"
                          radius="sm"
                          className="font-bold"
                        >
                          {det.estado}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionIcon
                          variant="subtle"
                          color="indigo"
                          radius="md"
                          className="opacity-60 hover:opacity-100 hover:bg-indigo-500/10"
                          onClick={() =>
                            openTrace(det.id_orden_compra_detalle, det.producto)
                          }
                          title="Ver trazabilidad"
                        >
                          <ClockIcon className="w-5 h-5" />
                        </ActionIcon>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
      <ModalEstandar
        opened={openedHistorial}
        close={() => setOpenedHistorial(false)}
        title="Historial de Recepciones"
        size="80%"
      >
        <HistorialRecepcionesOC idOrdenCompra={orden.id_orden_compra} />
      </ModalEstandar>

      <ModalEstandar
        opened={openedRecepcion}
        close={() => setOpenedRecepcion(false)}
        title="Nueva Recepción de Mercancía"
        size="85%"
      >
        <RegistroRecepcionOC
          idOrdenCompra={orden.id_orden_compra}
          detalles={detalles.filter((d) =>
            selectedIds.includes(d.id_orden_compra_detalle),
          )}
          onSuccess={async (lotesNuevos?: RES_TicketLote[]) => {
            setOpenedRecepcion(false);
            if (onSuccess) onSuccess();
            if (lotesNuevos && lotesNuevos.length > 0) {
              const tickets = await Promise.all(
                lotesNuevos.map(async (t) => {
                  const qrValue = JSON.stringify({
                    id: t.id,
                    producto: t.producto,
                    lote: t.lote,
                    almacen: t.almacen,
                    fecha_ingreso: dayjs(t.fecha_ingreso).format("DD/MM/YY"),
                  });
                  const qrDataUrl = await QRCode.toDataURL(qrValue, {
                    width: 120,
                    margin: 1,
                  });
                  return { ...t, qrDataUrl };
                }),
              );
              print(<TicketLotePDF tickets={tickets} />, {
                documentTitle: "Tickets Lotes",
                target: "TicketLotePrinter",
              });
            }
          }}
        />
      </ModalEstandar>

      <ModalEstandar
        opened={openedTrace}
        close={closeTrace}
        title="Trazabilidad del Producto"
        size="md"
      >
        {selectedItemId && (
          <TrazabilidadDetalleOC
            idDetalle={selectedItemId}
            productoNombre={selectedItemName}
          />
        )}
      </ModalEstandar>
    </Stack>
  );
};
