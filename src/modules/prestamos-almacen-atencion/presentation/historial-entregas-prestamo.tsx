import { useState } from "react";
import {
  Collapse,
  Paper,
  Group,
  Badge,
  Text,
  Stack,
  Loader,
  UnstyledButton,
} from "@mantine/core";
import dayjs from "dayjs";
import {
  TruckIcon,
  CalendarDaysIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import { ResumenRecepciones } from "./components/ResumenRecepciones";
import type { RES_PrestamoEntrega } from "../../../service/responses/prestamos/prestamo-entrega";
import {
  Estado_PrestamoEntrega,
  Estado_PrestamoEntregaDetalle,
} from "../../../shared/enums/prestamo-almacen/prestamo-entrega";
import { TipoBien } from "../../../shared/enums/_generic/tipo-bien";

interface Props {
  entregas: RES_PrestamoEntrega[];
  loading?: boolean;
}

export const HistorialEntregasPrestamo = ({ entregas, loading }: Props) => {
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [showTrazabilidad, setShowTrazabilidad] = useState<
    Record<number, boolean>
  >({});

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTrazabilidad = (id: number) => {
    setShowTrazabilidad((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id: number, index: number) => {
    if (expandedIds[id] !== undefined) return expandedIds[id];
    return index === 0; // Abre la primera por defecto
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  if (entregas.length === 0) {
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
  }

  return (
    <Stack
      gap="xl"
      className="font-sans pt-2 pb-6 max-h-[70vh] overflow-y-auto px-2"
    >
      {entregas.map((h, index) => {
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
                          h.estado === Estado_PrestamoEntrega.RecepcionCompleta
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
                          size="10px"
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
                      className="text-zinc-200 truncate max-w-[200px] lg:max-w-[300px]"
                    >
                      {h.personal_recibe}
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

                {/* Sección de Evidencias */}
                {h.evidencias &&
                  Array.isArray(h.evidencias) &&
                  h.evidencias.length > 0 && (
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
                        {h.evidencias.map((ev: IArchivo, idx) => (
                          <ArchivoCard
                            key={`${h.id_prestamo_entrega}-ev-${idx}`}
                            archivo={ev}
                          />
                        ))}
                      </div>
                    </div>
                  )}

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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4">
                  {h.detalles?.map((d) => (
                    <div
                      key={d.id_entrega_detalle}
                      className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/40 hover:border-indigo-500/30 transition-colors flex justify-between items-center relative overflow-hidden group/item"
                    >
                      <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/0 group-hover/item:bg-indigo-500/50 transition-colors" />

                      <div className="flex flex-col gap-1.5 pl-2 z-10 w-full pr-4">
                        <Text
                          size="sm"
                          fw={900}
                          className="text-white leading-tight"
                        >
                          {d.producto}
                        </Text>

                        {d.tipo_bien == TipoBien.ActivoFijo ? (
                          <Group gap="xs" wrap="nowrap" align="center">
                            <CubeIcon className="w-3.5 h-3.5 text-indigo-400" />
                            <Text
                              size="11px"
                              fw={800}
                              c="zinc.4"
                              className="uppercase tracking-widest leading-none"
                            >
                              Activo:
                            </Text>
                            <Badge
                              variant="outline"
                              color="yellow"
                              size="sm"
                              className="font-bold tracking-wider"
                            >
                              {d.correlativo_activo_fijo}
                            </Badge>
                          </Group>
                        ) : (
                          <Group gap="xs" wrap="nowrap" align="center">
                            <CubeIcon className="w-3.5 h-3.5 text-indigo-400" />
                            <Text
                              size="11px"
                              fw={800}
                              c="zinc.4"
                              className="uppercase tracking-widest leading-none"
                            >
                              Lote:
                            </Text>
                            <Badge
                              variant="light"
                              color="indigo"
                              size="sm"
                              className="font-bold tracking-wider"
                            >
                              {d.lote_correlativo}
                            </Badge>
                          </Group>
                        )}
                      </div>

                      <div className="text-right pl-4 pr-1 border-l border-zinc-800/50 min-w-max z-10 flex flex-col items-end justify-center">
                        <Group gap="xs" wrap="nowrap" align="center">
                          <Text
                            size="md"
                            fw={900}
                            className="text-emerald-400 font-mono leading-none"
                          >
                            +{formatNumber(d.cantidad_base)}
                          </Text>
                          <Text
                            size="12px"
                            fw={800}
                            c="zinc.5"
                            className="uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded-md inline-block mr-1"
                          >
                            {d.unidad_medida_base_abv || "UNI"}
                          </Text>
                        </Group>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Trazabilidad de Recepciones — si hay algo recibido (parcial o total) */}
                {h.detalles?.some(
                  (d) =>
                    d.estado === Estado_PrestamoEntregaDetalle.EnDespacho ||
                    d.estado ===
                      Estado_PrestamoEntregaDetalle.RecepcionCompleta ||
                    d.estado ===
                      Estado_PrestamoEntregaDetalle.RecepcionadoParcialmente,
                ) && (
                  <div className="px-4 pb-3 mt-4">
                    <UnstyledButton
                      onClick={() => toggleTrazabilidad(h.id_prestamo_entrega)}
                      className="w-full"
                    >
                      <Group
                        gap="xs"
                        className="py-2 px-3 rounded-lg border border-dashed border-zinc-700/60 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                      >
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-indigo-400/70" />
                        <Text
                          size="xs"
                          fw={700}
                          c="zinc.4"
                          className="flex-1 text-left"
                        >
                          Seguimiento de recepciones del destino
                        </Text>
                        {showTrazabilidad[h.id_prestamo_entrega] ? (
                          <ChevronUpIcon className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-zinc-500" />
                        )}
                      </Group>
                    </UnstyledButton>
                    <Collapse in={!!showTrazabilidad[h.id_prestamo_entrega]}>
                      <ResumenRecepciones idEntrega={h.id_prestamo_entrega} />
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
