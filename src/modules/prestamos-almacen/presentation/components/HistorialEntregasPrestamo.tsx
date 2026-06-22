import { useState } from "react";
import {
  Loader,
  Stack,
  Text,
  Badge,
  Paper,
  Group,
  Collapse,
  UnstyledButton,
} from "@mantine/core";
import dayjs from "dayjs";
import { useHistorialEntregasPrestamo } from "../../hooks/useHistorialEntregasPrestamo";
import {
  TruckIcon,
  CalendarDaysIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
  ExclamationCircleIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import { ArchivoCard } from "../../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../../shared/interfaces/archivo";
import type {
  RES_PrestamoEntrega,
  RES_PrestamoEntregaDetalle,
} from "../../../../service/responses/prestamos/prestamo-entrega";
import { Estado_PrestamoEntrega } from "../../../../shared/enums/prestamo-almacen/prestamo-entrega";
import type {
  RES_PrestamoEntregaRecepcion,
  RES_PrestamoEntregaRecepcionDetalle,
} from "../../../../service/responses/prestamos/prestamo-entrega-recepcion";

interface HistorialProps {
  idPrestamo: number;
}

export const HistorialEntregasPrestamo = ({ idPrestamo }: HistorialProps) => {
  const { loading, historial, error } =
    useHistorialEntregasPrestamo(idPrestamo);

  // Mantiene el estado de qué entregas están expandidas. Por defecto, expandir la primera.
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  // Mantiene el estado de qué recepciones están expandidas dentro de una entrega (Seguimiento)
  const [expandedRecepciones, setExpandedRecepciones] = useState<
    Record<number, boolean>
  >({});

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRecepciones = (idEntrega: number) => {
    setExpandedRecepciones((prev) => ({
      ...prev,
      [idEntrega]: !prev[idEntrega],
    }));
  };

  const isExpanded = (id: number, index: number) => {
    if (expandedIds[id] !== undefined) return expandedIds[id];
    return index === 0; // Abre la primera por defecto
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );

  if (error)
    return (
      <Text c="red" ta="center">
        {error}
      </Text>
    );

  if (historial.length === 0)
    return (
      <div className="py-12 text-center flex flex-col items-center gap-3">
        <div className="p-4 bg-zinc-900/30 rounded-full border border-zinc-800/50">
          <TruckIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <Text c="zinc.5" size="sm" fw={600}>
          No se han registrado entregas para este préstamo.
        </Text>
      </div>
    );

  return (
    <Stack
      gap="xl"
      className="font-sans pt-2 pb-6 max-h-[70vh] overflow-y-auto px-2"
    >
      {historial.map((h: RES_PrestamoEntrega, index: number) => {
        const expanded = isExpanded(h.id_prestamo_entrega, index);

        return (
          <Paper
            key={h.id_prestamo_entrega}
            radius="xl"
            className="bg-zinc-900/30 border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all hover:bg-zinc-900/50 hover:border-indigo-500/20 group relative overflow-hidden p-4 shrink-0"
          >
            {/* Elemento decorativo superior */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-violet-500/20 via-indigo-500/40 to-indigo-500/5 group-hover:from-violet-500/40 group-hover:via-indigo-500/60 transition-colors" />

            <UnstyledButton
              className="w-full p-5 sm:p-6"
              onClick={() => toggleExpand(h.id_prestamo_entrega)}
            >
              <Group
                justify="space-between"
                align="center"
                wrap="nowrap"
                gap="xl"
              >
                <Group gap="md" wrap="nowrap" className="shrink-0">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                    <TruckIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Group gap="xs">
                      <Text
                        size="sm"
                        fw={900}
                        className="text-white tracking-wide"
                      >
                        {h.correlativo}
                      </Text>
                      <Badge
                        variant="light"
                        color={
                          h.estado == Estado_PrestamoEntrega.EnDespacho
                            ? "teal"
                            : "violet"
                        }
                        radius="sm"
                        className="font-bold"
                        size="xs"
                      >
                        {h.estado}
                      </Badge>
                    </Group>
                    <Group gap="xs" className="text-zinc-400" wrap="nowrap">
                      <Group gap="xs" wrap="nowrap">
                        <CalendarDaysIcon className="w-4 h-4 shrink-0 text-indigo-400/70" />
                        <Text size="xs" fw={600} className="whitespace-nowrap">
                          {dayjs(h.fecha_hora_entrega).format(
                            "DD/MM/YYYY hh:mm A",
                          )}
                        </Text>
                      </Group>
                      <Group
                        gap="xs"
                        className="bg-zinc-950/50 px-2.5 py-1 rounded-md border border-zinc-800/60 ml-1 shrink-0"
                        wrap="nowrap"
                      >
                        <UserIcon className="w-3 h-3 text-zinc-400" />
                        <Text
                          size="11px"
                          fw={700}
                          c="zinc.4"
                          className="whitespace-nowrap"
                        >
                          Por:{" "}
                          <span className="text-zinc-300">
                            {h.empleado_entrega}
                          </span>
                        </Text>
                      </Group>
                    </Group>
                  </div>
                </Group>

                <Group
                  gap="lg"
                  wrap="nowrap"
                  justify="flex-end"
                  className="flex-1 min-w-0"
                >
                  <div className="text-right hidden md:flex flex-col items-end gap-0.5 truncate shrink">
                    <Text
                      size="9px"
                      c="zinc.5"
                      fw={800}
                      className="uppercase tracking-widest"
                    >
                      Entregado a
                    </Text>
                    <Text
                      size="sm"
                      fw={800}
                      className="text-zinc-200 truncate max-w-50 lg:max-w-75"
                    >
                      {h.empleado_recibe || "N/A"}
                    </Text>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:bg-zinc-800/80 transition-colors">
                    {expanded ? (
                      <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                    )}
                  </div>
                </Group>
              </Group>
            </UnstyledButton>

            <Collapse in={expanded}>
              <div className="px-6 pt-2 border-t border-zinc-800/30">
                <div className="mb-6 bg-zinc-950/40 rounded-xl p-4 border border-zinc-800/40 flex gap-3 items-start shadow-inner">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-400/50 mt-0.5 shrink-0" />
                  <div>
                    <Text
                      size="10px"
                      fw={800}
                      c="zinc.5"
                      className="uppercase tracking-widest mb-1.5"
                    >
                      Observaciones de la Entrega
                    </Text>
                    <Text
                      size="sm"
                      c="zinc.3"
                      className="italic max-w-2xl leading-relaxed"
                    >
                      {h.observacion ||
                        "Sin observaciones adicionales reportadas durante esta entrega operativa."}
                    </Text>
                  </div>
                </div>

                {/* Sección de Evidencias de Entrega */}
                {h.evidencias && h.evidencias.length > 0 && (
                  <div className="mt-8 pb-4">
                    <Group gap="xs" mb="md" className="pl-1">
                      <PaperClipIcon className="w-4 h-4 text-zinc-500" />
                      <Text
                        size="xs"
                        fw={800}
                        c="zinc.4"
                        className="uppercase tracking-widest"
                      >
                        Evidencias de Entrega ({h.evidencias.length})
                      </Text>
                    </Group>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {h.evidencias.map((ev: IArchivo, idx: number) => (
                        <ArchivoCard
                          key={`${h.id_prestamo_entrega}-ev-${idx}`}
                          archivo={ev}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* PRODUCTOS DESPACHADOS */}
                <Group gap="xs" mb="md" mt="md" className="pl-1">
                  <CubeIcon className="w-4 h-4 text-zinc-500" />
                  <Text
                    size="xs"
                    fw={800}
                    c="zinc.4"
                    className="uppercase tracking-widest"
                  >
                    Productos Despachados ({h.detalles?.length || 0})
                  </Text>
                </Group>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-6">
                  {h.detalles?.map((d: RES_PrestamoEntregaDetalle) => (
                    <div
                      key={d.id_entrega_detalle}
                      className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/40 hover:border-indigo-500/30 transition-colors flex justify-between items-center relative overflow-hidden group/item"
                    >
                      <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/0 group-hover/item:bg-indigo-500/50 transition-colors" />

                      <div className="flex flex-col gap-1.5 pl-2 z-10 w-full pr-4">
                        <Group gap="xs" wrap="nowrap" align="center">
                          <CubeIcon className="w-3.5 h-3.5 text-indigo-400" />
                          <Text
                            size="sm"
                            fw={900}
                            className="text-white leading-tight"
                          >
                            {d.producto}
                          </Text>
                        </Group>
                      </div>

                      <div className="text-right pl-4 pr-1 border-l border-zinc-800/50 min-w-max z-10 flex flex-col items-end justify-center">
                        <Group gap="xs" wrap="nowrap" align="center">
                          <Text
                            size="md"
                            fw={900}
                            className="text-emerald-400 font-mono leading-none"
                          >
                            +{formatNumber(d.cantidad_prestamo)}
                          </Text>
                          <Text
                            size="12px"
                            fw={800}
                            c="zinc.5"
                            className="uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded-md inline-block mr-1"
                          >
                            {d.unidad_medida_pr_abv || "UNI"}
                          </Text>

                          {d.unidad_medida_pr_abv !==
                            d.unidad_medida_base_abv && (
                            <>
                              <div className="w-px h-6 bg-zinc-800/80 mx-1"></div>
                              <Text
                                size="md"
                                fw={700}
                                className="text-emerald-500/70 font-mono leading-none"
                              >
                                +{formatNumber(d.cantidad_base)}
                              </Text>
                              <Text
                                size="12px"
                                fw={800}
                                c="zinc.5"
                                className="uppercase tracking-widest bg-zinc-900/50 px-1.5 py-0.5 rounded-md inline-block"
                              >
                                {d.unidad_medida_base_abv}
                              </Text>
                            </>
                          )}
                        </Group>
                      </div>
                    </div>
                  ))}
                </div>

                {/* SECCIÓN DE RECEPCIONES (PLEGABLE - IGUAL A SOLICITUDES REABASTECIMIENTO) */}
                {h.recepciones && h.recepciones.length > 0 && (
                  <div className="pb-6">
                    <UnstyledButton
                      onClick={() => toggleRecepciones(h.id_prestamo_entrega)}
                      className="w-full"
                    >
                      <Group
                        gap="xs"
                        className="py-2.5 px-4 rounded-xl border border-dashed border-zinc-700/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group/recep"
                      >
                        <ClipboardDocumentListIcon className="w-4 h-4 text-emerald-400/70 group-hover/recep:text-emerald-400" />
                        <Text
                          size="xs"
                          fw={800}
                          c="zinc.4"
                          className="flex-1 uppercase tracking-widest group-hover/recep:text-zinc-200"
                        >
                          Seguimiento de recepciones ({h.recepciones.length})
                        </Text>
                        {expandedRecepciones[h.id_prestamo_entrega] ? (
                          <ChevronUpIcon className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-zinc-500" />
                        )}
                      </Group>
                    </UnstyledButton>

                    <Collapse in={!!expandedRecepciones[h.id_prestamo_entrega]}>
                      <Stack
                        gap="lg"
                        mt="md"
                        className="animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        {h.recepciones.map(
                          (r: RES_PrestamoEntregaRecepcion, idx: number) => (
                            <Paper
                              key={r.id_recepcion}
                              radius="xl"
                              className={`bg-zinc-900/40 border overflow-hidden shadow-lg p-5 transition-all duration-300 ${
                                r.con_incidencia
                                  ? "border-rose-500/25 hover:border-rose-400/40"
                                  : "border-zinc-800/60 hover:border-emerald-500/30"
                              }`}
                            >
                              <Group
                                justify="space-between"
                                mb="md"
                                wrap="nowrap"
                              >
                                <Group gap="md" wrap="nowrap">
                                  <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                                      r.con_incidencia
                                        ? "bg-rose-500/10 border-rose-500/20"
                                        : "bg-emerald-500/10 border-emerald-500/20"
                                    }`}
                                  >
                                    <ShoppingBagIcon
                                      className={`w-5 h-5 ${r.con_incidencia ? "text-rose-400" : "text-emerald-400"}`}
                                    />
                                  </div>
                                  <div>
                                    <Group gap="xs" wrap="nowrap">
                                      <Text
                                        size="xs"
                                        fw={900}
                                        className="text-white whitespace-nowrap"
                                      >
                                        Recepción #{h.recepciones.length - idx}
                                      </Text>
                                      {r.con_incidencia && (
                                        <Badge
                                          color="rose"
                                          variant="light"
                                          size="xs"
                                          leftSection={
                                            <ExclamationCircleIcon className="w-3 h-3" />
                                          }
                                        >
                                          INCIDENCIA
                                        </Badge>
                                      )}
                                    </Group>
                                    <Group
                                      gap="xs"
                                      className="mt-0.5"
                                      wrap="nowrap"
                                    >
                                      <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                      <Text
                                        size="11px"
                                        fw={700}
                                        c="zinc.5"
                                        className="whitespace-nowrap"
                                      >
                                        {dayjs(r.fecha_hora_recepcion).format(
                                          "DD/MM/YYYY HH:mm",
                                        )}
                                      </Text>
                                      <span className="text-zinc-700 mx-1">
                                        •
                                      </span>
                                      <UserIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                      <Text
                                        size="11px"
                                        fw={700}
                                        c="zinc.4"
                                        className="truncate max-w-[120px]"
                                      >
                                        {r.empleado_registro}
                                      </Text>
                                    </Group>
                                  </div>
                                </Group>
                                <Badge
                                  variant="dot"
                                  color="teal"
                                  size="sm"
                                  className="shrink-0"
                                >
                                  {r.estado}
                                </Badge>
                              </Group>

                              {/* Productos Recibidos (Chips style from ResumenRecepciones) */}
                              <Group
                                gap={6}
                                wrap="wrap"
                                mb={
                                  r.observacion ||
                                  (r.evidencias && r.evidencias.length > 0)
                                    ? "md"
                                    : 0
                                }
                              >
                                {r.detalles.map(
                                  (rd: RES_PrestamoEntregaRecepcionDetalle) => (
                                    <div
                                      key={rd.id_recepcion_detalle}
                                      className="inline-flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800/50 px-2.5 py-1 rounded-full transition-colors hover:border-emerald-500/20"
                                    >
                                      <Text
                                        size="11px"
                                        fw={700}
                                        className="text-zinc-400"
                                      >
                                        {rd.producto}
                                      </Text>
                                      <Text
                                        size="11px"
                                        fw={900}
                                        className="text-emerald-400 font-mono"
                                      >
                                        +
                                        {formatNumber(
                                          rd.cantidad_recepcionada_pr,
                                        )}
                                        <span className="font-sans text-[10px] ml-0.5 text-emerald-500/70">
                                          {rd.unidad_medida_pr_abv}
                                        </span>
                                      </Text>
                                    </div>
                                  ),
                                )}
                              </Group>

                              {r.observacion && (
                                <div className="mb-4 bg-zinc-950/30 p-3 rounded-2xl border border-zinc-800/40">
                                  <Group gap="xs" mb={4}>
                                    <ExclamationCircleIcon className="w-3 h-3 text-rose-400/50" />
                                    <Text
                                      size="10px"
                                      fw={800}
                                      c="zinc.5"
                                      className="uppercase tracking-widest"
                                    >
                                      Observación
                                    </Text>
                                  </Group>
                                  <Text
                                    size="xs"
                                    c="zinc.3"
                                    className="italic leading-relaxed"
                                  >
                                    "{r.observacion}"
                                  </Text>
                                </div>
                              )}

                              {/* Evidencias de Recepción */}
                              {r.evidencias && r.evidencias.length > 0 && (
                                <div>
                                  <Group gap="xs" mb="sm">
                                    <PaperClipIcon className="w-3 h-3 text-zinc-500" />
                                    <Text
                                      size="10px"
                                      fw={900}
                                      c="zinc.5"
                                      className="uppercase tracking-widest"
                                    >
                                      Evidencias ({r.evidencias.length})
                                    </Text>
                                  </Group>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {r.evidencias.map((ev, idx) => (
                                      <ArchivoCard
                                        key={`rec-${r.id_recepcion}-ev-${idx}`}
                                        archivo={ev}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </Paper>
                          ),
                        )}
                      </Stack>
                    </Collapse>
                  </div>
                )}
              </div>
            </Collapse>
          </Paper>
        );
      })}
    </Stack>
  );
};
