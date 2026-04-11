import { useState } from "react";
import {
  Collapse,
  Paper,
  Group,
  Badge,
  Text,
  Stack,
  Loader,
  Button,
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
  CheckCircleIcon,
  BuildingStorefrontIcon,
  ExclamationTriangleIcon,
  ChatBubbleBottomCenterTextIcon,
  InboxArrowDownIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  type RES_ReposicionPrestamo,
  type RES_DetalleReposicionParaRecepcion,
} from "../service/prestamos-atencion.responses";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import { ArchivoCard } from "../../../presentation/utils/archivo-card";
import type { IArchivo } from "../../../shared/interfaces";
import { useNotify } from "../../../hooks/useNotify";
import { RegistroRecepcion } from "./registro-recepcion";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { usePrint } from "../../../hooks/usePrint";
import { TicketLotePDF } from "../../../presentation/utils/TicketLotePDF";
import type { RES_TicketLote } from "../../../presentation/utils/TicketLotePDF";
import QRCode from "qrcode";

interface Props {
  reposiciones: RES_ReposicionPrestamo[];
  loading?: boolean;
  onSuccess: () => void;
  idAlmacenLender: number; // El almacén que está recibiendo (linder del préstamo original)
}

export const HistorialReposicionesPrestamo = ({
  reposiciones,
  loading,
  onSuccess,
  idAlmacenLender,
}: Props) => {
  const { notifyError } = useNotify();
  const { print } = usePrint();
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [expandedRecepcionIds, setExpandedRecepcionIds] = useState<
    Record<number, boolean>
  >({});
  const [showTrazabilidad, setShowTrazabilidad] = useState<
    Record<number, boolean>
  >({});
  const [selectedRepo, setSelectedRepo] =
    useState<RES_ReposicionPrestamo | null>(null);
  const [detailsForReception, setDetailsForReception] = useState<
    RES_DetalleReposicionParaRecepcion[]
  >([]);
  const [openedRecepcion, setOpenedRecepcion] = useState(false);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpandRecepcion = (id: number) => {
    setExpandedRecepcionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleTrazabilidad = (idReposicion: number) => {
    setShowTrazabilidad((prev) => ({
      ...prev,
      [idReposicion]: !prev[idReposicion],
    }));
  };

  const isExpanded = (id: number, index: number) => {
    if (expandedIds[id] !== undefined) return expandedIds[id];
    return index === 0;
  };

  const handleOpenRecepcion = (repo: RES_ReposicionPrestamo) => {
    if (!repo.detalles || repo.detalles.length === 0) {
      notifyError("Esta reposición no tiene productos registrados");
      return;
    }

    const mapped: RES_DetalleReposicionParaRecepcion[] = repo.detalles.map(
      (d) => ({
        id_entrega_detalle: d.id_reposicion_detalle,
        id_solicitud_reabastecimiento_detalle: d.id_reposicion_detalle,
        id_reabastecimiento_entrega: repo.id_reposicion,
        cantidad_base: Number(d.cantidad_base),
        cantidad_lote: Number(d.cantidad_lote),
        cantidad_solicitud: Number(d.cantidad_prestamo),
        estado_entrega_detalle: d.estado,
        id_producto: d.id_producto,
        producto: d.producto,
        es_perecible: d.es_perecible,
        id_unidad_medida_base: d.id_unidad_medida_base,
        unidad_base_abv: d.unidad_medida_base_abv,
        id_unidad_medida_solicitada: d.id_unidad_medida_solicitada,
        contenido_por_presentacion_solicitado: 1, // Se asume 1 para préstamos
        unidad_medida_solicitud_abv: d.unidad_medida_base_abv, // Se asume base
        id_lote_origen: d.id_lote_producto,
        correlativo_lote_origen: d.lote_correlativo,
        unidad_lote_abv: d.unidad_medida_lote_abv,
        id_unidad_medida_lote: d.id_unidad_medida_lote,
        fecha_vencimiento: null, // El almacén destino decidirá
        tipo_entrega: "Reposicion",
      }),
    );

    setDetailsForReception(mapped);
    setSelectedRepo(repo);
    setOpenedRecepcion(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  if (reposiciones.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center gap-3">
        <div className="p-4 bg-zinc-900/30 rounded-full border border-zinc-800/50">
          <TruckIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <Text c="zinc.5" size="sm" fw={600}>
          No se han registrado reposiciones para este préstamo.
        </Text>
      </div>
    );
  }

  return (
    <>
      <Stack
        gap="xl"
        className="font-sans pt-2 pb-6 max-h-[70vh] overflow-y-auto px-2"
      >
        {reposiciones.map((h, index) => {
          const expanded = isExpanded(h.id_reposicion, index);
          const isPendingReception =
            h.estado === "En Despacho" ||
            h.estado === "Recepcionado Parcialmente";

          // Parse evidencias if it's a string
          let evidenciasArray: IArchivo[] = [];
          if (h.evidencias) {
            try {
              evidenciasArray =
                typeof h.evidencias === "string"
                  ? JSON.parse(h.evidencias)
                  : h.evidencias;
            } catch (e) {
              console.error("Error parsing evidencias", e);
            }
          }

          return (
            <Paper
              key={h.id_reposicion}
              radius="xl"
              className="bg-zinc-900/30 border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all hover:bg-zinc-900/50 hover:border-indigo-500/20 group relative overflow-hidden p-4 shrink-0"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-violet-500/20 via-indigo-500/40 to-indigo-500/5 group-hover:from-violet-500/40 group-hover:via-indigo-500/60 transition-colors" />

              <div
                className="w-full p-5 sm:p-6 cursor-pointer"
                onClick={() => toggleExpand(h.id_reposicion)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleExpand(h.id_reposicion);
                  }
                }}
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
                            h.estado === "Recepcionado" ? "teal" : "orange"
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
                          <Text
                            size="xs"
                            fw={600}
                            className="whitespace-nowrap"
                          >
                            {dayjs(h.fecha_hora_reposicion).format(
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
                              {h.registrado_por}
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
                        Enviado desde
                      </Text>
                      <Group gap={4} wrap="nowrap">
                        <BuildingStorefrontIcon className="w-3 h-3 text-zinc-400" />
                        <Text
                          size="xs"
                          fw={800}
                          className="text-zinc-200 truncate max-w-[200px]"
                        >
                          {h.almacen_entrega}
                        </Text>
                      </Group>
                    </div>

                    {isPendingReception && (
                      <Button
                        size="xs"
                        variant="gradient"
                        gradient={{ from: "indigo.6", to: "violet.6" }}
                        radius="md"
                        leftSection={<CheckCircleIcon className="w-4 h-4" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRecepcion(h);
                        }}
                      >
                        Registrar Stock
                      </Button>
                    )}

                    <div className="w-8 h-8 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:bg-zinc-800/80 transition-colors">
                      {expanded ? (
                        <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>
                  </Group>
                </Group>
              </div>

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
                        Observaciones de Logística
                      </Text>
                      <Text
                        size="sm"
                        c="zinc.3"
                        className="italic max-w-2xl leading-relaxed"
                      >
                        {h.observacion ||
                          "Sin observaciones adicionales reportadas."}
                      </Text>
                    </div>
                  </div>

                  {/* Sección de Evidencias */}
                  {evidenciasArray.length > 0 && (
                    <div className="mt-8 pb-4">
                      <Group gap="xs" mb="md" className="pl-1">
                        <PaperClipIcon className="w-4 h-4 text-zinc-500" />
                        <Text
                          size="11px"
                          fw={800}
                          c="zinc.4"
                          className="uppercase tracking-widest"
                        >
                          Evidencias de Reposición ({evidenciasArray.length})
                        </Text>
                      </Group>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {evidenciasArray.map((ev, idx) => (
                          <ArchivoCard
                            key={`${h.id_reposicion}-ev-${idx}`}
                            archivo={ev}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <Group gap="xs" mb="md" mt="md" className="pl-1">
                    <CubeIcon className="w-4 h-4 text-zinc-500" />
                    <Text
                      size="11px"
                      fw={800}
                      c="zinc.4"
                      className="uppercase tracking-widest"
                    >
                      Productos Repuestos ({h.detalles?.length || 0})
                    </Text>
                  </Group>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-4">
                    {h.detalles?.map((d) => (
                      <div
                        key={d.id_reposicion_detalle}
                        className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/40 hover:border-indigo-500/30 transition-colors flex justify-between items-center relative overflow-hidden group/item"
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/0 group-hover/item:bg-indigo-500/50 transition-colors" />

                        <div className="flex flex-row gap-2 pl-2 z-10 w-full pr-4 items-center">
                          <CubeIcon className="w-4 h-4 text-indigo-400" />
                          <Text
                            size="sm"
                            fw={900}
                            className="text-white leading-tight"
                          >
                            {d.producto}
                          </Text>
                        </div>

                        <div className="text-right pl-4 pr-1 border-l border-zinc-800/50 min-w-max z-10 flex flex-col items-end justify-center">
                          <Group gap="xs" wrap="nowrap" align="center">
                            <Text
                              size="sm"
                              fw={900}
                              className="text-emerald-400 font-mono leading-none"
                            >
                              +{formatNumber(Number(d.cantidad_base))}
                            </Text>
                            <Text
                              size="12px"
                              fw={800}
                              c="zinc.5"
                              className="uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded-md inline-block mr-1"
                            >
                              {d.unidad_medida_base || "UNI"}
                            </Text>
                          </Group>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sección de Recepciones */}
                  {h.recepciones && h.recepciones.length > 0 && (
                    <div className="mt-8 pb-6 animate-in fade-in duration-500">
                      <UnstyledButton
                        onClick={() => toggleTrazabilidad(h.id_reposicion)}
                        className="w-full mb-3"
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
                            className="flex-1"
                          >
                            Seguimiento de recepciones
                          </Text>
                          {showTrazabilidad[h.id_reposicion] ? (
                            <ChevronUpIcon className="w-4 h-4 text-zinc-500" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 text-zinc-500" />
                          )}
                        </Group>
                      </UnstyledButton>

                      <Collapse in={!!showTrazabilidad[h.id_reposicion]}>
                        <Stack gap="xs" mt="sm">
                          {h.recepciones.map((rec, recIdx) => {
                            const hasDetail =
                              !!rec.observacion ||
                              (rec.evidencias && rec.evidencias.length > 0);
                            const isRecOpen =
                              !!expandedRecepcionIds[rec.id_recepcion];
                            const isPartial =
                              rec.estado === "Recepcionado Parcialmente";

                            return (
                              <Paper
                                key={rec.id_recepcion}
                                radius="md"
                                className={`border overflow-hidden transition-all duration-300 hover:bg-zinc-900/30 ${
                                  rec.con_incidencia
                                    ? "border-rose-500/25 shadow-[0_0_12px_rgba(99,102,241,0.06)] hover:border-rose-500/40"
                                    : "border-zinc-500/25 hover:border-zinc-500/50"
                                }`}
                              >
                                <UnstyledButton
                                  onClick={() =>
                                    hasDetail &&
                                    toggleExpandRecepcion(rec.id_recepcion)
                                  }
                                  className={`w-full transition-colors ${
                                    hasDetail
                                      ? "cursor-pointer hover:bg-zinc-900/70"
                                      : "cursor-default"
                                  } bg-zinc-950/50`}
                                >
                                  <div className="p-3">
                                    <Group
                                      justify="space-between"
                                      wrap="nowrap"
                                      mb={8}
                                    >
                                      <Group gap="sm">
                                        <div
                                          className={`p-1.5 rounded-lg ${
                                            rec.con_incidencia
                                              ? "bg-rose-500/10"
                                              : "bg-emerald-500/10"
                                          }`}
                                        >
                                          <InboxArrowDownIcon
                                            className={`w-4 h-4 ${
                                              rec.con_incidencia
                                                ? "text-rose-400"
                                                : "text-emerald-400"
                                            }`}
                                          />
                                        </div>
                                        <Text
                                          size="xs"
                                          fw={900}
                                          className="text-white"
                                        >
                                          Recepción #
                                          {h.recepciones!.length - recIdx}
                                        </Text>
                                        {isPartial && (
                                          <Badge
                                            size="xs"
                                            variant="dot"
                                            color="orange"
                                          >
                                            Parcial
                                          </Badge>
                                        )}
                                        {rec.con_incidencia && (
                                          <Badge
                                            size="xs"
                                            variant="light"
                                            color="pink"
                                            leftSection={
                                              <ExclamationTriangleIcon className="w-2.5 h-2.5" />
                                            }
                                          >
                                            Incidencia
                                          </Badge>
                                        )}
                                      </Group>
                                      {hasDetail &&
                                        (isRecOpen ? (
                                          <ChevronUpIcon className="w-4 h-4 text-zinc-500" />
                                        ) : (
                                          <ChevronDownIcon className="w-4 h-4 text-zinc-500" />
                                        ))}
                                    </Group>

                                    <Group gap="xs">
                                      <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                                      <Text size="xs" c="dimmed">
                                        Recepcionado por:{" "}
                                        <span className="text-zinc-200 font-semibold">
                                          {rec.empleado_registro}
                                        </span>
                                      </Text>
                                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                      <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-500" />
                                      <Text size="xs" c="dimmed">
                                        {dayjs(rec.fecha_hora_recepcion).format(
                                          "DD/MM/YYYY - HH:mm",
                                        )}
                                      </Text>
                                    </Group>

                                    <Group gap={4} wrap="wrap" mt="xs">
                                      {rec.detalles?.map((rd) => (
                                        <span
                                          key={rd.id_recepcion_detalle}
                                          className="inline-flex items-center gap-1 bg-zinc-900/60 border border-zinc-800/50 px-2 py-0.5 rounded-full"
                                        >
                                          <Text
                                            size="xs"
                                            className="text-zinc-400"
                                          >
                                            {rd.producto}
                                          </Text>
                                          <Text
                                            size="xs"
                                            fw={900}
                                            className="text-emerald-400 font-mono"
                                          >
                                            +
                                            {formatNumber(
                                              Number(
                                                rd.cantidad_recepcionada_base,
                                              ),
                                            )}
                                            <span className="font-normal ml-0.5">
                                              {rd.unidad_medida_base_abv}
                                            </span>
                                          </Text>
                                        </span>
                                      ))}
                                    </Group>
                                  </div>
                                </UnstyledButton>

                                <Collapse in={isRecOpen}>
                                  <Stack
                                    gap="sm"
                                    p="sm"
                                    pt={0}
                                    className="border-t border-zinc-800/40 bg-zinc-950/20"
                                  >
                                    <div className="pt-3">
                                      {rec.observacion && (
                                        <div className="mb-3">
                                          <Group gap="xs" mb={5}>
                                            <ChatBubbleBottomCenterTextIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                                            <Text
                                              size="10px"
                                              fw={800}
                                              c="zinc.5"
                                              className="uppercase tracking-widest"
                                            >
                                              Observación de la Incidencia
                                            </Text>
                                          </Group>
                                          <Text
                                            size="xs"
                                            className="italic text-zinc-300 leading-relaxed whitespace-pre-wrap pl-1"
                                          >
                                            "{rec.observacion}"
                                          </Text>
                                        </div>
                                      )}

                                      {rec.evidencias &&
                                        rec.evidencias.length > 0 && (
                                          <div>
                                            <Group gap="xs" mb={6}>
                                              <PaperClipIcon className="w-3.5 h-3.5 text-indigo-400/70" />
                                              <Text
                                                size="10px"
                                                fw={800}
                                                c="zinc.5"
                                                className="uppercase tracking-widest"
                                              >
                                                Evidencias (
                                                {rec.evidencias.length})
                                              </Text>
                                            </Group>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                              {rec.evidencias.map((ev, i) => (
                                                <ArchivoCard
                                                  key={i}
                                                  archivo={ev}
                                                />
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  </Stack>
                                </Collapse>
                              </Paper>
                            );
                          })}
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

      {/* Modal de Recepción */}
      <ModalEstandar
        opened={openedRecepcion}
        close={() => setOpenedRecepcion(false)}
        title="Registrar Recepción"
        rightSection={
          <Badge
            variant="light"
            color="indigo"
            radius="sm"
            className="font-bold border border-indigo-500/20"
          >
            {selectedRepo?.correlativo}
          </Badge>
        }
        size="75%"
      >
        <div className="py-2">
          {selectedRepo && (
            <RegistroRecepcion
              idAlmacenSolicitante={idAlmacenLender}
              detalles={
                detailsForReception as unknown as RES_DetalleReposicionParaRecepcion[]
              }
              idEntrega={selectedRepo.id_reposicion}
              tipoEntrega="Reposicion"
              onSuccess={async (lotesNuevos?: RES_TicketLote[]) => {
                setOpenedRecepcion(false);
                onSuccess();
                if (lotesNuevos && lotesNuevos.length > 0) {
                  const tickets = await Promise.all(
                    lotesNuevos.map(async (t) => {
                      const qrValue = JSON.stringify({
                        id: t.id,
                        producto: t.producto,
                        lote: t.lote,
                        almacen: t.almacen,
                        fecha_ingreso: dayjs(t.fecha_ingreso).format(
                          "DD/MM/YY",
                        ),
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
          )}
        </div>
      </ModalEstandar>
    </>
  );
};
