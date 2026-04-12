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
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import type { RES_Cotizacion, RES_CotizacionDetalle } from "../service/cotizaciones.responses";
import { MetodoPago } from "../../../shared/enums/estados";
import { TablaDetalleResumen } from "./detalle/tabla-detalle-resumen";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

interface ListadoComparativosProps {
  cotizaciones: RES_Cotizacion[];
  detalles: RES_CotizacionDetalle[];
  busqueda: string;
}

// ─── Colores y labels por estado ──────────────────────────────────────────────
const estadoConfig: Record<string, { color: string; label: string; variant: "filled" | "light" | "outline" }> = {
  Generada:    { color: "indigo", label: "Generada",    variant: "light"  },
  Aprobada:    { color: "teal",   label: "Aprobada",    variant: "filled" },
  Desestimada: { color: "zinc",   label: "Desestimada", variant: "outline" },
};

export const ListadoComparativos = ({
  cotizaciones,
  detalles,
  busqueda,
}: ListadoComparativosProps) => {
  const [expandedComps, setExpandedComps] = useState<Record<number, boolean>>({});
  const [expandedCots, setExpandedCots] = useState<Record<number, boolean>>({});

  const [modalComparativoOpened, setModalComparativoOpened] = useState(false);
  const [selectedCompId, setSelectedCompId] = useState<number | null>(null);
  const [resumenDetalleIsCollapsed, setResumenDetalleIsCollapsed] = useState(false);

  const toggleComp = (id: number) =>
    setExpandedComps((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleCot = (id: number) =>
    setExpandedCots((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleVerComparativo = (id: number) => {
    setSelectedCompId(id);
    setModalComparativoOpened(true);
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
        <Text size="sm" fw={700} className="text-zinc-400 uppercase tracking-widest">
          {busqueda ? "Sin resultados" : "No hay cotizaciones"}
        </Text>
        <Text size="xs" c="dimmed" className="mt-1">
          {busqueda ? "Intenta con otro término." : "Comience creando un nuevo comparativo."}
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
                        tieneAprobada
                          ? "bg-teal-500/10"
                          : "bg-indigo-500/10"
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
                          {cots.length} {cots.length === 1 ? "Cotización" : "Cotizaciones"}
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
                  const cfg = estadoConfig[cot.estado] ?? { color: "zinc", label: cot.estado };

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
                                <Text size="xs" fw={900} className="text-indigo-300">
                                  {cot.correlativo}
                                </Text>
                              </div>

                              <Stack gap={1}>
                                <Text size="sm" fw={800} className="text-white leading-tight">
                                  {cot.proveedor_nombre}
                                </Text>
                                <Group gap="xs">
                                  {/* Método pago */}
                                  <Badge
                                    variant="light"
                                    color={cot.metodo_pago === MetodoPago.Credito ? "violet" : "cyan"}
                                    size="xs"
                                  >
                                    {cot.metodo_pago === MetodoPago.Credito
                                      ? `Crédito${cot.fecha_vencimiento_pago ? ` · Vence ${dayjs(cot.fecha_vencimiento_pago).format("DD/MM/YY")}` : ""}`
                                      : "Contado"}
                                  </Badge>
                                  {/* Moneda */}
                                  <Badge variant="outline" color="zinc" size="xs">
                                    {cot.moneda}
                                  </Badge>
                                  {/* Estado */}
                                  <Badge
                                    variant={cfg.variant}
                                    color={cfg.color}
                                    size="xs"
                                  >
                                    {cfg.label}
                                  </Badge>
                                </Group>
                              </Stack>
                            </Group>

                            <Group gap="sm" wrap="nowrap">
                              {/* Total */}
                              <Stack gap={0} align="flex-end" className="hidden sm:flex">
                                <Text size="xs" c="dimmed" fw={700} className="uppercase tracking-wider">
                                  Total
                                </Text>
                                <Text size="sm" fw={900} className="text-emerald-400 font-mono">
                                  {cot.moneda === "Soles" ? "S/." : "$"}{" "}
                                  {formatNumber(Number(cot.total_despues_igv))}
                                </Text>
                              </Stack>

                              {/* Botón Aprobar (visual only) */}
                              <Tooltip label="Próximamente" withArrow>
                                <Button
                                  size="xs"
                                  radius="xl"
                                  color="green"
                                  variant="filled"
                                  leftSection={<CheckBadgeIcon className="w-3.5 h-3.5" />}
                                  disabled={cot.estado === "Aprobada" || cot.estado === "Desestimada"}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Aprobar
                                </Button>
                              </Tooltip>

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
                              <Text size="xs" c="dimmed">
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
                                  {cot.moneda === "Soles" ? "S/." : "$"} {formatNumber(Number(cot.total_antes_igv))}
                                </span>
                              </Text>
                            </Group>
                            {/* Monto IGV */}
                            <Group gap="xs">
                              <CurrencyDollarIcon className="w-3.5 h-3.5 text-zinc-500" />
                              <Text size="xs" c="dimmed">
                                IGV ({cot.porcentaje_igv}%):{" "}
                                <span className="text-zinc-300 font-bold">
                                  {cot.moneda === "Soles" ? "S/." : "$"} {formatNumber(Number(cot.monto_igv))}
                                </span>
                              </Text>
                            </Group>
                            {/* Total con IGV */}
                            <Group gap="xs">
                              <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500/70" />
                              <Text size="xs" c="dimmed">
                                Total (con IGV):{" "}
                                <span className="text-emerald-400 font-bold">
                                  {cot.moneda === "Soles" ? "S/." : "$"} {formatNumber(Number(cot.total_despues_igv))}
                                </span>
                              </Text>
                            </Group>
                            {/* Fecha vencimiento (solo crédito) */}
                            {cot.metodo_pago === MetodoPago.Credito && cot.fecha_vencimiento_pago && (
                              <Group gap="xs">
                                <ClockIcon className="w-3.5 h-3.5 text-violet-400" />
                                <Text size="xs" c="dimmed">
                                  Vence:{" "}
                                  <span className="text-violet-300 font-bold">
                                    {dayjs(cot.fecha_vencimiento_pago).format("DD/MM/YYYY")}
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
                              <Text size="xs" c="dimmed" fw={800} className="uppercase tracking-widest mb-1">
                                Observaciones
                              </Text>
                              <Text size="xs" className="italic text-zinc-300">
                                {cot.observacion}
                              </Text>
                            </Paper>
                          )}

                          {/* Tabla de productos */}
                          <Group gap="xs" mb="xs" px="xs">
                            <CubeIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                            <Text size="xs" fw={800} c="zinc.4" className="uppercase tracking-widest">
                              Productos Cotizados ({cotDetalles.length})
                            </Text>
                          </Group>

                          <div className="grid grid-cols-1 gap-2">
                            {cotDetalles.map((det) => {
                              const subtotal = Number(det.cantidad) * Number(det.precio_unitario);
                              return (
                                <div
                                  key={det.id}
                                  className="bg-zinc-900/70 rounded-xl border border-zinc-800/40 px-4 py-3 hover:border-indigo-500/20 transition-colors"
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    {/* Info izquierda */}
                                    <Stack gap={2} className="flex-1">
                                      <Text size="sm" fw={800} className="text-zinc-100">
                                        {det.producto_nombre}
                                      </Text>
                                      <Text size="xs" c="dimmed">
                                        {formatNumber(det.cantidad)} {det.unidad_medida_abv}
                                        {det.contenido_por_presentacion > 1 &&
                                          ` × ${det.contenido_por_presentacion} = ${formatNumber(det.cantidad_base)} und. base`}
                                      </Text>
                                    </Stack>

                                    {/* Precio unitario + Subtotal — lado a lado */}
                                    <Group gap="xs" wrap="nowrap" className="shrink-0">
                                      <Badge
                                        variant="light"
                                        color="pink"
                                        size="sm"
                                        radius="md"
                                      >
                                        {cot.moneda === "Soles" ? "S/." : "$"} {formatNumber(Number(det.precio_unitario))} / {det.unidad_medida_abv}
                                      </Badge>
                                      <Badge
                                        variant="filled"
                                        color="pink"
                                        size="sm"
                                        radius="md"
                                      >
                                        Sub: {cot.moneda === "Soles" ? "S/." : "$"} {formatNumber(subtotal)}
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
                                        <Text size="xs" className="italic text-zinc-400 leading-relaxed">
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
            <Tooltip label={resumenDetalleIsCollapsed ? "Ver Detalle Extendido" : "Ver Vista Resumida"} withArrow>
              <ActionIcon 
                variant="light" 
                color={resumenDetalleIsCollapsed ? "cyan" : "indigo"} 
                size="lg" 
                radius="xl"
                onClick={() => setResumenDetalleIsCollapsed(!resumenDetalleIsCollapsed)}
                className="shadow-lg active:scale-95 transition-all border border-white/10"
              >
                {resumenDetalleIsCollapsed ? <ListBulletIcon className="w-5 h-5" /> : <TableCellsIcon className="w-5 h-5" />}
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      >
        <div style={{ height: "75vh" }}>
          {selectedCompId && (
            <TablaDetalleResumen
              isCollapsed={resumenDetalleIsCollapsed}
              cotizaciones={comparativosMap[selectedCompId]}
              detalles={detalles.filter(d => 
                comparativosMap[selectedCompId].some(c => c.id === d.id_cotizacion)
              )}
            />
          )}
        </div>
      </ModalEstandar>
    </Stack>
  );
};
