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
import { useHistorialEntregas } from "../hooks/useHistorialEntregas";
import {
  TruckIcon,
  CalendarDaysIcon,
  UserIcon,
  CubeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import { ResumenRecepciones } from "../../solicitudes-reabastecimiento/presentation/ResumenRecepciones";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

interface HistorialProps {
  idSolicitud: number;
}

export const HistorialEntregas = ({ idSolicitud }: HistorialProps) => {
  const { loading, entregas, error } = useHistorialEntregas(idSolicitud);
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
  if (entregas.length === 0)
    return (
      <div className="py-12 text-center flex flex-col items-center gap-3">
        <div className="p-4 bg-zinc-900/30 rounded-full border border-zinc-800/50">
          <TruckIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <Text c="zinc.5" size="sm" fw={600}>
          No se han registrado entregas para esta solicitud.
        </Text>
      </div>
    );

  return (
    <Stack gap="xl" className="font-sans pt-2 pb-6 px-2">
      {entregas.map((h, index) => {
        const expanded =
          expandedIds[h.id_reabastecimiento_entrega] ?? index === 0;
        return (
          <Paper
            key={h.id_reabastecimiento_entrega}
            radius="xl"
            className="bg-zinc-900/30 border border-zinc-800/80 transition-all hover:bg-zinc-900/50 relative overflow-hidden p-4"
          >
            <UnstyledButton
              className="w-full"
              onClick={() => toggleExpand(h.id_reabastecimiento_entrega)}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <TruckIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <Stack gap={1}>
                    <Group gap="xs">
                      <Text size="sm" fw={900} className="text-white">
                        {h.correlativo}
                      </Text>
                      {h.tipo_entrega === "Prestamo" && (
                        <Badge variant="filled" color="indigo" size="xs">
                          Préstamo
                        </Badge>
                      )}
                      <Badge
                        variant="light"
                        color={
                          h.estado === "Recibida" || h.estado === "Recibido"
                            ? "teal"
                            : h.estado === "Procesada" ||
                                h.estado === "Recepcionado Parcialmente"
                              ? "orange"
                              : "indigo"
                        }
                        size="xs"
                      >
                        {h.estado === "Recepcionado Parcialmente"
                          ? "Parcial"
                          : h.estado}
                      </Badge>
                    </Group>
                    <Group gap="xs" className="text-zinc-400">
                      <CalendarDaysIcon className="w-4 h-4 text-indigo-400/70" />
                      <Text size="xs" fw={600}>
                        {dayjs(h.fecha_hora_entrega).format("DD/MM/YYYY HH:mm")}
                      </Text>
                    </Group>
                  </Stack>
                </Group>
                <div className="w-8 h-8 rounded-full bg-zinc-800/40 flex items-center justify-center border border-zinc-700/50">
                  {expanded ? (
                    <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </Group>
            </UnstyledButton>
            <Collapse in={expanded}>
              <div className="mt-4 pt-4 border-t border-zinc-800/30">
                <Group gap="sm" mb="md" px="md">
                  <UserIcon className="w-4 h-4 text-zinc-500" />
                  <Text size="xs" c="dimmed">
                    Atendido por:{" "}
                    <span className="text-white">{h.empleado_entrega}</span>
                  </Text>
                  <div className="w-1 h-1 rounded-full bg-zinc-700 mx-2" />
                  <UserIcon className="w-4 h-4 text-zinc-500" />
                  <Text size="xs" c="dimmed">
                    Entregado a:{" "}
                    <span className="text-white">{h.empleado_recibe}</span>
                  </Text>
                </Group>
                {h.observacion && (
                  <Paper
                    p="sm"
                    radius="md"
                    className="bg-zinc-950/50 border border-zinc-800 mb-4 mx-4 shadow-inner"
                  >
                    <Text
                      size="xs"
                      c="dimmed"
                      mb={4}
                      fw={800}
                      className="uppercase tracking-widest"
                    >
                      Observaciones
                    </Text>
                    <Text size="sm" className="italic leading-relaxed">
                      {h.observacion}
                    </Text>
                  </Paper>
                )}

                {/* Sección de Evidencias */}
                {h.evidencias && h.evidencias.length > 0 && (
                  <div className="mt-4 px-4 pb-4">
                    <Group gap="xs" mb="sm">
                      <PaperClipIcon className="w-4 h-4 text-zinc-500" />
                      <Text
                        size="xs"
                        fw={800}
                        c="zinc.4"
                        className="uppercase tracking-widest"
                      >
                        Evidencias ({h.evidencias.length})
                      </Text>
                    </Group>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {h.evidencias.map((ev, idx) => (
                        <ArchivoCard
                          key={`${h.id_reabastecimiento_entrega}-ev-${idx}`}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 px-4 pb-2">
                  {h.detalles?.map((d) => (
                    <div
                      key={d.id_entrega_detalle}
                      className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/40 hover:border-indigo-500/30 transition-colors flex justify-between items-center relative overflow-hidden group/item"
                    >
                      {/* Highlight lateral en hover item */}
                      <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/0 group-hover/item:bg-indigo-500/50 transition-colors" />

                      <div className="flex flex-col gap-1.5 pl-2 z-10 w-full pr-4">
                        <Text
                          size="sm"
                          fw={900}
                          className="text-white leading-tight"
                        >
                          {d.producto}
                        </Text>

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
                      </div>

                      <div className="text-right pl-4 pr-1 border-l border-zinc-800/50 min-w-max z-10 flex flex-col items-end justify-center">
                        <Group gap="xs" wrap="nowrap" align="center">
                          <Text
                            size="md"
                            fw={900}
                            className="text-emerald-400 font-mono leading-none"
                          >
                            +{formatNumber(d.cantidad_lote)}
                          </Text>
                          <Text
                            size="12px"
                            fw={800}
                            c="zinc.5"
                            className="uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded-md inline-block mr-1"
                          >
                            {d.unidad_medida_lot_abv || "UNI"}
                          </Text>

                          {d.id_unidad_medida_lote !=
                            d.id_unidad_medida_base && (
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

                {/* Trazabilidad de Recepciones — si hay algo recibido (parcial o total) */}
                {h.detalles?.some(
                  (d) =>
                    d.estado_entrega_detalle === "Recibido" ||
                    d.estado_entrega_detalle === "Entregado",
                ) && (
                  <div className="px-4 pb-3 mt-4">
                    <UnstyledButton
                      onClick={() =>
                        toggleTrazabilidad(h.id_reabastecimiento_entrega)
                      }
                      className="w-full"
                    >
                      <Group
                        gap="xs"
                        className="py-2 px-3 rounded-lg border border-dashed border-zinc-700/60 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all"
                      >
                        <ClipboardDocumentListIcon className="w-4 h-4 text-indigo-400/70" />
                        <Text
                          size="xs"
                          fw={700}
                          c="zinc.4"
                          className="flex-1 text-left"
                        >
                          Seguimiento de recepciones del destino
                        </Text>
                        {showTrazabilidad[h.id_reabastecimiento_entrega] ? (
                          <ChevronUpIcon className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-zinc-500" />
                        )}
                      </Group>
                    </UnstyledButton>
                    <Collapse
                      in={!!showTrazabilidad[h.id_reabastecimiento_entrega]}
                    >
                      <ResumenRecepciones
                        idEntrega={h.id_reabastecimiento_entrega}
                        tipoEntrega={h.tipo_entrega || "Solicitud"}
                      />
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
