import { useState } from "react";
import {
  Stack,
  Text,
  Badge,
  Paper,
  Group,
  Collapse,
  UnstyledButton,
  Button,
  Divider,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import dayjs from "dayjs";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentMagnifyingGlassIcon,
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BanknotesIcon,
  CubeIcon,
  TableCellsIcon,
  ReceiptPercentIcon,
  ListBulletIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { formatNumber } from "../../../shared/functions/formatNumber";
import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../service/cotizaciones.responses";
import { MetodoPago } from "../../../shared/enums/_generic/metodo-pago";
import { TablaDetalleResumen } from "./detalle/tabla-detalle-resumen";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import {
  Estado_Cotizacion,
  Estado_Cotizacion_Detalle,
} from "../../../shared/enums/cotizacion/cotizacion";
import { usePrint } from "../../../hooks/usePrint";
import { CotizacionPDF } from "./cotizacion-pdf";
import { ModalAprobarCotizacion } from "./detalle/modal-aprobar-cotizacion";
import { OrdenCompraService } from "../../orden-compra/service/orden-compra.service";
import { OrdenCompraPDF } from "../../orden-compra/presentation/orden-compra-pdf";
import { MONEDAS } from "../../../shared/variables/monedas";
import { useNotify } from "../../../hooks/useNotify";

interface ListadoComparativosProps {
  cotizaciones: RES_Cotizacion[];
  detalles: RES_CotizacionDetalle[];
  empresas: {
    id_cotizacion: number;
    id_empresa: number;
    razon_social: string;
  }[];
  busqueda: string;
  onUpdateLocal?: (
    id: number,
    nuevoEstado: Estado_Cotizacion,
    detallesAprobados?: RES_CotizacionDetalle[],
    id_orden_compra?: number,
  ) => void;
}

// ─── Colores y labels por estado ──────────────────────────────────────────────
const COLOR_BY_STATE: Record<
  string,
  { color: string; label: string; variant: string }
> = {
  [Estado_Cotizacion.Generada]: {
    color: "indigo",
    label: "Generada",
    variant: "light",
  },
  [Estado_Cotizacion.Aprobada]: {
    color: "teal",
    label: "Aprobada",
    variant: "filled",
  },
};

export const ListadoComparativos = ({
  cotizaciones,
  detalles,
  empresas,
  busqueda,
  onUpdateLocal,
}: ListadoComparativosProps) => {
  const { print } = usePrint();
  const { notify } = useNotify();
  const [printingOCId, setPrintingOCId] = useState<number | null>(null);
  const [expandedComps, setExpandedComps] = useState<Record<number, boolean>>(
    {},
  );
  const [expandedCots, setExpandedCots] = useState<Record<number, boolean>>({});

  const [modalComparativoOpened, setModalComparativoOpened] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState<number | null>(null);
  const [resumenDetalleIsCollapsed, setResumenDetalleIsCollapsed] =
    useState(false);

  const [modalAprobarOpened, setModalAprobarOpened] = useState(false);
  const [selectedCotIdParaAprobar, setSelectedCotIdParaAprobar] = useState<
    number | null
  >(null);

  const toggleComp = (id: number) =>
    setExpandedComps((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCot = (id: number) =>
    setExpandedCots((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleVerComparativo = (id: number) => {
    setSelectedCompId(id);
    setModalComparativoOpened(true);
  };

  const handlePrintCotizacion = (cot: RES_Cotizacion) => {
    const cotDetalles = detalles.filter((d) => d.id_cotizacion === cot.id);
    const nombresEmpresas = (empresas || [])
      .filter((e) => e.id_cotizacion === cot.id)
      .map((e) => e.razon_social);

    print(
      <CotizacionPDF
        cotizaciones={[
          {
            cotizacion: cot,
            detalles: cotDetalles,
            empresas: nombresEmpresas,
          },
        ]}
      />,
      {
        documentTitle: `Cotización - ${cot.correlativo}`,
      },
    );
  };

  const handleApprove = (id: number) => {
    setSelectedCotIdParaAprobar(id);
    setModalAprobarOpened(true);
  };

  const handleSuccessAprobacion = (
    id: number,
    _cotizacionModificada: RES_Cotizacion,
    detallesAprobados: RES_CotizacionDetalle[],
    id_orden_compra?: number,
  ) => {
    onUpdateLocal?.(id, Estado_Cotizacion.Aprobada, detallesAprobados, id_orden_compra);
  };

  const handlePrintOC = async (id_orden_compra: number) => {
    setPrintingOCId(id_orden_compra);
    try {
      const [resOrden, resDetalles] = await Promise.all([
        OrdenCompraService.get_ordenes(),
        OrdenCompraService.get_detalles(id_orden_compra),
      ]);
      if (resOrden.success && resDetalles.success) {
        const ordenData = resOrden.data.ordenes.find((o) => o.id === id_orden_compra);
        if (ordenData) {
          print(
            <OrdenCompraPDF orden={ordenData} detalles={resDetalles.data.detalles} />,
            { documentTitle: `OC - ${ordenData.correlativo}` }
          );
        }
      } else {
        notify({ type: "error", content: "No se pudo cargar la Orden de Compra." });
      }
    } catch {
      notify({ type: "error", content: "Error al generar el PDF de la OC." });
    } finally {
      setPrintingOCId(null);
    }
  };

  // Agrupamos por comparativo
  const comparativosMap = cotizaciones.reduce(
    (acc: Record<number, RES_Cotizacion[]>, curr) => {
      if (!acc[curr.id_comparativo]) acc[curr.id_comparativo] = [];
      acc[curr.id_comparativo].push(curr);
      return acc;
    },
    {},
  );

  const idsOrdenados = Object.keys(comparativosMap)
    .map(Number)
    .sort((a, b) => b - a);

  // Filtrado por búsqueda
  const idsFiltrados = idsOrdenados.filter((id) => {
    const cots = comparativosMap[id];
    return (
      id.toString().includes(busqueda) ||
      cots.some(
        (c) =>
          c.correlativo.toLowerCase().includes(busqueda.toLowerCase()) ||
          c.proveedor_nombre.toLowerCase().includes(busqueda.toLowerCase()),
      )
    );
  });

  if (idsFiltrados.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 border border-dashed border-zinc-800 rounded-4xl bg-zinc-900/10 backdrop-blur-sm">
        <DocumentMagnifyingGlassIcon className="w-12 h-12 text-zinc-700 mb-4" />
        <Text
          size="sm"
          fw={700}
          className="text-zinc-400 uppercase tracking-widest"
        >
          {busqueda ? "Sin resultados" : "No hay cotizaciones"}
        </Text>
        <Text size="xs" c="dimmed" className="mt-1">
          {busqueda
            ? "Intenta con otro término."
            : "Comience creando un nuevo comparativo."}
        </Text>
      </div>
    );
  }

  return (
    <Stack gap="lg">
      {idsFiltrados.map((idComp) => {
        const cots = comparativosMap[idComp];
        const fecha = cots[0]?.comparativo_fecha || cots[0]?.created_at;
        const tieneAprobada = cots.some((c) => c.estado === "Aprobada");
        const isCompExpanded = expandedComps[idComp] ?? false;

        return (
          <Paper
            key={idComp}
            radius="xl"
            className="bg-zinc-900/40 border border-zinc-800/80 transition-all overflow-hidden"
          >
            {/* ── CABECERA DEL COMPARATIVO ── */}
            <UnstyledButton
              component="div"
              className="w-full"
              onClick={() => toggleComp(idComp)}
            >
              <div className="px-5 py-4">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="md" wrap="nowrap">
                    {/* Ícono */}
                    <div
                      className={`p-3 rounded-2xl ${
                        tieneAprobada ? "bg-teal-500/10" : "bg-indigo-500/10"
                      }`}
                    >
                      {tieneAprobada ? (
                        <CheckBadgeIcon className="w-6 h-6 text-teal-400" />
                      ) : (
                        <DocumentMagnifyingGlassIcon className="w-6 h-6 text-indigo-400" />
                      )}
                    </div>

                    {/* Info principal */}
                    <Stack gap={2}>
                      <Group gap="xs" wrap="nowrap">
                        <Text size="sm" fw={900} className="text-white">
                          Comparativo #{idComp}
                        </Text>
                        <Badge
                          variant="dot"
                          color={tieneAprobada ? "teal" : "orange"}
                          size="sm"
                        >
                          {tieneAprobada ? "Completado" : "Pendiente"}
                        </Badge>
                      </Group>
                      <Group gap="xs" className="text-zinc-400">
                        <CalendarDaysIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                        <Text size="xs" fw={600}>
                          {dayjs(fecha).format("DD/MM/YYYY HH:mm")}
                        </Text>
                        <div className="w-1 h-1 rounded-full bg-zinc-700 mx-1" />
                        <BuildingStorefrontIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                        <Text size="xs" fw={600}>
                          {cots.length}{" "}
                          {cots.length === 1 ? "Cotización" : "Cotizaciones"}
                        </Text>
                      </Group>
                    </Stack>
                  </Group>

                  {/* Botón ver comparativo + chevron */}
                  <Group gap="sm" wrap="nowrap">
                    <Button
                      size="xs"
                      radius="xl"
                      variant="light"
                      color="indigo"
                      leftSection={<TableCellsIcon className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerComparativo(idComp);
                      }}
                    >
                      Ver Comparativo
                    </Button>
                    <div className="w-8 h-8 rounded-full bg-zinc-800/60 flex items-center justify-center border border-zinc-700/50 shrink-0">
                      {isCompExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </Group>
                </Group>
              </div>
            </UnstyledButton>

            {/* ── CUERPO EXPANDIBLE: COTIZACIONES ── */}
            <Collapse in={isCompExpanded}>
              <Divider color="zinc.8" mx="md" />
              <Stack gap="sm" p="md">
                {cots.map((cot) => {
                  const isCotExpanded = expandedCots[cot.id] ?? false;
                  const cotDetalles = detalles.filter(
                    (d) => d.id_cotizacion === cot.id,
                  );
                  const cfg = COLOR_BY_STATE[cot.estado] ?? {
                    color: "zinc",
                    label: cot.estado,
                    variant: "light",
                  };

                  return (
                    <Paper
                      key={cot.id}
                      radius="xl"
                      className="bg-zinc-950/50 border border-zinc-800/60 transition-all hover:border-zinc-700/60 overflow-hidden"
                    >
                      {/* Cabecera de la cotización individual */}
                      <UnstyledButton
                        component="div"
                        className="w-full"
                        onClick={() => toggleCot(cot.id)}
                      >
                        <div className="px-4 py-3">
                          <Group justify="space-between" wrap="nowrap">
                            <Group gap="sm" wrap="nowrap">
                              {/* Correlativo */}
                              <div className="font-mono bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                                <Text
                                  size="xs"
                                  fw={900}
                                  className="text-indigo-300"
                                >
                                  {cot.correlativo}
                                </Text>
                              </div>

                              <Stack gap={1}>
                                <Group gap="sm" wrap="nowrap">
                                  <Text
                                    size="sm"
                                    fw={800}
                                    className="text-white leading-tight"
                                  >
                                    {cot.proveedor_nombre}
                                  </Text>
                                  <Badge
                                    variant={cfg.variant}
                                    color={cfg.color}
                                    size="xs"
                                    radius="sm"
                                    className="font-bold border border-current/10"
                                  >
                                    {cfg.label}
                                  </Badge>
                                </Group>
                                <Group gap="xs">
                                  {/* Método pago */}
                                  <Badge
                                    variant="light"
                                    color={
                                      cot.metodo_pago === MetodoPago.Credito
                                        ? "violet"
                                        : "cyan"
                                    }
                                    size="xs"
                                  >
                                    {cot.metodo_pago === MetodoPago.Credito
                                      ? `Crédito${cot.fecha_vencimiento_pago ? ` · Vence ${dayjs(cot.fecha_vencimiento_pago).format("DD/MM/YY")}` : ""}`
                                      : "Contado"}
                                  </Badge>
                                  {/* Moneda */}
                                  <Badge
                                    variant="outline"
                                    color="zinc"
                                    size="xs"
                                  >
                                    {cot.moneda}
                                  </Badge>
                                </Group>
                              </Stack>
                            </Group>

                            <Group gap="sm" wrap="nowrap">
                              {/* Total */}
                              <Stack
                                gap={0}
                                align="flex-end"
                                className="hidden sm:flex"
                              >
                                <Text
                                  size="xs"
                                  c="dimmed"
                                  fw={700}
                                  className="uppercase tracking-wider"
                                >
                                  Total
                                </Text>
                                <Text
                                  size="sm"
                                  fw={900}
                                  className="text-emerald-400 font-mono"
                                >
                                  {Object.values(MONEDAS).find((m) => m.label === cot.moneda)?.symbol ?? "S/"}{" "}
                                  {formatNumber(Number(cot.total_despues_igv))}
                                </Text>
                              </Stack>

                              {/* Botón Imprimir Cotizacion */}
                              <Tooltip label="Ver Cotización" withArrow>
                                <ActionIcon
                                  variant="light"
                                  color="indigo"
                                  radius="xl"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrintCotizacion(cot);
                                  }}
                                >
                                  <DocumentMagnifyingGlassIcon className="w-4 h-4" />
                                </ActionIcon>
                              </Tooltip>

                              {/* Botón Ver Orden de Compra (solo cuando ya fue aprobada) */}
                              {cot.id_orden_compra && (
                                <Tooltip label="Ver Orden de Compra" withArrow>
                                  <ActionIcon
                                    variant="light"
                                    color="teal"
                                    radius="xl"
                                    size="sm"
                                    loading={printingOCId === cot.id_orden_compra}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePrintOC(cot.id_orden_compra!);
                                    }}
                                  >
                                    <ClipboardDocumentCheckIcon className="w-4 h-4" />
                                  </ActionIcon>
                                </Tooltip>
                              )}

                              {/* Botón Aprobar */}
                              <Button
                                size="xs"
                                radius="xl"
                                color="green"
                                variant="filled"
                                leftSection={
                                  <CheckBadgeIcon className="w-3.5 h-3.5" />
                                }
                                disabled={
                                  cot.estado === Estado_Cotizacion.Aprobada
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(cot.id);
                                }}
                              >
                                Aprobar
                              </Button>

                              <div className="w-6 h-6 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0">
                                {isCotExpanded ? (
                                  <ChevronUpIcon className="w-3.5 h-3.5 text-zinc-500" />
                                ) : (
                                  <ChevronDownIcon className="w-3.5 h-3.5 text-zinc-500" />
                                )}
                              </div>
                            </Group>
                          </Group>
                        </div>
                      </UnstyledButton>

                      {/* Detalles expandibles de la cotización */}
                      <Collapse in={isCotExpanded}>
                        <div className="px-4 pb-4 pt-0">
                          <Divider color="zinc.8" mb="sm" />

                          {/* Desglose IGV */}
                          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3 px-1">
                            {/* Incluye IGV */}
                            <Group gap="xs">
                              <ReceiptPercentIcon className="w-3.5 h-3.5 text-zinc-500" />
                              <Text
                                size="xs"
                                c="dimmed"
                                component="div"
                                className="flex items-center gap-1"
                              >
                                IGV incluido:{" "}
                                <Badge
                                  variant="light"
                                  color={cot.incluye_igv ? "teal" : "orange"}
                                  size="xs"
                                >
                                  {cot.incluye_igv ? "Sí" : "No"}
                                </Badge>
                              </Text>
                            </Group>
                            {/* Subtotal */}
                            <Group gap="xs">
                              <BanknotesIcon className="w-3.5 h-3.5 text-zinc-500" />
                              <Text size="xs" c="dimmed">
                                Subtotal (sin IGV):{" "}
                                <span className="text-zinc-300 font-bold">
                                  {cot.moneda === "Soles" ? "S/." : "$"}{" "}
                                  {formatNumber(Number(cot.total_antes_igv))}
                                </span>
                              </Text>
                            </Group>
                            {/* Monto IGV */}
                            <Group gap="xs">
                              <CurrencyDollarIcon className="w-3.5 h-3.5 text-zinc-500" />
                              <Text size="xs" c="dimmed">
                                IGV ({cot.porcentaje_igv}%):{" "}
                                <span className="text-zinc-300 font-bold">
                                  {cot.moneda === "Soles" ? "S/." : "$"}{" "}
                                  {formatNumber(Number(cot.monto_igv))}
                                </span>
                              </Text>
                            </Group>
                            {/* Total con IGV */}
                            <Group gap="xs">
                              <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500/70" />
                              <Text size="xs" c="dimmed">
                                Total (con IGV):{" "}
                                <span className="text-emerald-400 font-bold">
                                  {cot.moneda === "Soles" ? "S/." : "$"}{" "}
                                  {formatNumber(Number(cot.total_despues_igv))}
                                </span>
                              </Text>
                            </Group>
                            {/* Fecha vencimiento (solo crédito) */}
                            {cot.metodo_pago === MetodoPago.Credito &&
                              cot.fecha_vencimiento_pago && (
                                <Group gap="xs">
                                  <ClockIcon className="w-3.5 h-3.5 text-violet-400" />
                                  <Text size="xs" c="dimmed">
                                    Vence:{" "}
                                    <span className="text-violet-300 font-bold">
                                      {dayjs(cot.fecha_vencimiento_pago).format(
                                        "DD/MM/YYYY",
                                      )}
                                    </span>
                                  </Text>
                                </Group>
                              )}
                          </div>

                          {/* Observación */}
                          {cot.observacion && (
                            <Paper
                              p="xs"
                              radius="md"
                              mb="sm"
                              className="bg-zinc-900/60 border border-zinc-800"
                            >
                              <Text
                                size="xs"
                                c="dimmed"
                                fw={800}
                                className="uppercase tracking-widest mb-1"
                              >
                                Observaciones
                              </Text>
                              <Text size="xs" className="italic text-zinc-300">
                                {cot.observacion}
                              </Text>
                            </Paper>
                          )}

                          {/* Empresas Compradoras */}
                          {(() => {
                            const cotEmpresas = empresas.filter(
                              (e) => e.id_cotizacion === cot.id,
                            );
                            if (cotEmpresas.length === 0) return null;
                            return (
                              <div className="mb-4">
                                <Group gap="xs" mb="xs" px="xs">
                                  <BuildingStorefrontIcon className="w-3.5 h-3.5 text-emerald-400/70" />
                                  <Text
                                    size="xs"
                                    fw={800}
                                    c="zinc.4"
                                    className="uppercase tracking-widest"
                                  >
                                    Empresas Compradoras ({cotEmpresas.length})
                                  </Text>
                                </Group>
                                <div className="flex flex-wrap gap-2 px-1">
                                  {cotEmpresas.map((emp) => (
                                    <div
                                      key={emp.id_empresa}
                                      className="bg-zinc-900/70 rounded-xl border border-zinc-800/40 px-3 py-2 hover:border-emerald-500/20 transition-colors flex items-center gap-2"
                                    >
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                      <Text
                                        size="11px"
                                        fw={700}
                                        className="text-zinc-200 leading-tight"
                                      >
                                        {emp.razon_social}
                                      </Text>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}

                          {/* Tabla de productos */}
                          <Group gap="xs" mb="xs" px="xs">
                            <CubeIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                            <Text
                              size="xs"
                              fw={800}
                              c="zinc.4"
                              className="uppercase tracking-widest"
                            >
                              Productos Cotizados ({cotDetalles.length})
                            </Text>
                          </Group>

                          <div className="grid grid-cols-1 gap-2">
                            {cotDetalles.map((det) => {
                              const subtotal =
                                Number(det.cantidad) *
                                Number(det.precio_unitario);
                              return (
                                <div
                                  key={det.id}
                                  className="bg-zinc-900/70 rounded-xl border border-zinc-800/40 px-4 py-3 hover:border-indigo-500/20 transition-colors"
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    {/* Info izquierda */}
                                    <Stack gap={2} className="flex-1">
                                      <Group gap="xs">
                                        <Text
                                          size="sm"
                                          fw={800}
                                          className={
                                            det.estado ===
                                            Estado_Cotizacion_Detalle.Rechazado
                                              ? "text-zinc-500 line-through"
                                              : "text-zinc-100"
                                          }
                                        >
                                          {det.producto_nombre}
                                        </Text>
                                        {det.estado ===
                                          Estado_Cotizacion_Detalle.Aprobado && (
                                          <Badge
                                            size="xs"
                                            color="teal"
                                            variant="light"
                                            className="border-teal-500/20"
                                          >
                                            Aprobado
                                          </Badge>
                                        )}
                                        {det.estado ===
                                          Estado_Cotizacion_Detalle.Rechazado && (
                                          <Badge
                                            size="xs"
                                            color="red"
                                            variant="light"
                                            className="border-red-500/20"
                                          >
                                            Rechazado
                                          </Badge>
                                        )}
                                        {det.estado ===
                                          Estado_Cotizacion_Detalle.Pendiente && (
                                          <Badge
                                            size="xs"
                                            color="gray"
                                            variant="light"
                                            className="border-zinc-500/20 text-zinc-300"
                                          >
                                            Pendiente
                                          </Badge>
                                        )}
                                      </Group>
                                      <Text
                                        size="xs"
                                        c={
                                          det.estado ===
                                          Estado_Cotizacion_Detalle.Rechazado
                                            ? "zinc.6"
                                            : "dimmed"
                                        }
                                      >
                                        {formatNumber(det.cantidad)}{" "}
                                        {det.unidad_medida_abv}
                                        {det.contenido_por_presentacion > 1 &&
                                          ` × ${det.contenido_por_presentacion} = ${formatNumber(det.cantidad_base)} und. base`}
                                      </Text>
                                    </Stack>

                                    {/* Precio unitario + Subtotal — lado a lado */}
                                    <Group
                                      gap="xs"
                                      wrap="nowrap"
                                      className="shrink-0"
                                    >
                                      <Badge
                                        variant="light"
                                        color="pink"
                                        size="sm"
                                        radius="md"
                                      >
                                        {cot.moneda === "Soles" ? "S/." : "$"}{" "}
                                        {formatNumber(
                                          Number(det.precio_unitario),
                                        )}{" "}
                                        / {det.unidad_medida_abv}
                                      </Badge>
                                      <Badge
                                        variant="filled"
                                        color="pink"
                                        size="sm"
                                        radius="md"
                                      >
                                        Sub:{" "}
                                        {cot.moneda === "Soles" ? "S/." : "$"}{" "}
                                        {formatNumber(subtotal)}
                                      </Badge>
                                    </Group>
                                  </div>

                                  {/* Comentario (solo si existe) */}
                                  {det.comentario && (
                                    <div className="mt-3 pt-2 border-t border-zinc-800/50">
                                      <Text
                                        size="xs"
                                        c="dimmed"
                                        fw={800}
                                        className="uppercase tracking-widest mb-1"
                                      >
                                        Comentario
                                      </Text>
                                      <div className="flex gap-2">
                                        <div className="w-0.5 rounded-full bg-indigo-500/40 shrink-0" />
                                        <Text
                                          size="xs"
                                          className="italic text-zinc-400 leading-relaxed"
                                        >
                                          {det.comentario}
                                        </Text>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Stack>
            </Collapse>
          </Paper>
        );
      })}
      {/* MODAL DE COMPARATIVO MATRICIAL */}
      <ModalEstandar
        opened={modalComparativoOpened}
        onClose={() => setModalComparativoOpened(false)}
        close={() => setModalComparativoOpened(false)}
        title="Cuadro comparativo de Cotizaciones"
        size="95%"
        rightSection={
          <Group gap="xs" mr="xl">
            <Tooltip
              label={
                resumenDetalleIsCollapsed
                  ? "Ver Detalle Extendido"
                  : "Ver Vista Resumida"
              }
              withArrow
            >
              <ActionIcon
                variant="light"
                color={resumenDetalleIsCollapsed ? "cyan" : "indigo"}
                size="lg"
                radius="xl"
                onClick={() =>
                  setResumenDetalleIsCollapsed(!resumenDetalleIsCollapsed)
                }
                className="shadow-lg active:scale-95 transition-all border border-white/10"
              >
                {resumenDetalleIsCollapsed ? (
                  <ListBulletIcon className="w-5 h-5" />
                ) : (
                  <TableCellsIcon className="w-5 h-5" />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      >
        <div style={{ height: "70vh" }}>
          {selectedCompId && (
            <TablaDetalleResumen
              isCollapsed={resumenDetalleIsCollapsed}
              cotizaciones={comparativosMap[selectedCompId]}
              empresas={empresas}
              detalles={detalles.filter((d) =>
                comparativosMap[selectedCompId].some(
                  (c) => c.id === d.id_cotizacion,
                ),
              )}
              onApprove={handleApprove}
              loadingApprove={null}
            />
          )}
        </div>
      </ModalEstandar>

      {/* Modal Aprobación Parcial y Orden de Compra */}
      <ModalAprobarCotizacion
        opened={modalAprobarOpened}
        onClose={() => setModalAprobarOpened(false)}
        cotizacion={
          selectedCotIdParaAprobar
            ? cotizaciones.find((c) => c.id === selectedCotIdParaAprobar) ||
              null
            : null
        }
        detalles={
          selectedCotIdParaAprobar
            ? detalles.filter(
                (d) => d.id_cotizacion === selectedCotIdParaAprobar,
              )
            : []
        }
        empresas={
          selectedCotIdParaAprobar
            ? empresas.filter(
                (e) => e.id_cotizacion === selectedCotIdParaAprobar,
              )
            : []
        }
        onSuccess={handleSuccessAprobacion}
      />
    </Stack>
  );
};
