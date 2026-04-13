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
  Button,
} from "@mantine/core";
import dayjs from "dayjs";
import { useHistorialEntregas } from "../hooks/useHistorialEntregas";
import type { HistorialEntregaDetalleItem } from "../hooks/useHistorialEntregas";
import {
  TruckIcon,
  CalendarDaysIcon,
  UserIcon,
  CubeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckBadgeIcon,
  BuildingStorefrontIcon,
  PaperClipIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { ResumenRecepciones } from "./ResumenRecepciones";
import { usePrint } from "../../../hooks/usePrint";
import { TicketLotePDF } from "../../../presentation/utils/ticket-lote-pdf";
import { RegistroRecepcion } from "./registro-recepcion";
import type { RES_TicketLote } from "../../../service/responses/lote-producto";
import QRCode from "qrcode";
import { Estado_SolicitudEntregaDetalle } from "../../../shared/enums/solicitud-reabastecimiento/solicitud-entrega";
import { Estado_SolicitudEntrega } from "../../../shared/enums/solicitud-reabastecimiento/solicitud-entrega";

interface HistorialProps {
  idSolicitud: number;
  idAlmacenSolicitante: number;
  almacenSolicitante: string;
}

export const HistorialEntregas = ({
  idSolicitud,
  idAlmacenSolicitante,
  almacenSolicitante,
}: HistorialProps) => {
  const { loading, entregas, error, reload } =
    useHistorialEntregas(idSolicitud);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const { print } = usePrint();

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [showTrazabilidad, setShowTrazabilidad] = useState<
    Record<number, boolean>
  >({});
  const toggleTrazabilidad = (idEntrega: number) => {
    setShowTrazabilidad((prev) => ({ ...prev, [idEntrega]: !prev[idEntrega] }));
  };

  const [recepcionData, setRecepcionData] = useState<{
    idEntrega: number;
    tipoEntrega: "Solicitud" | "Prestamo";
    detallesPendientes: HistorialEntregaDetalleItem[];
  } | null>(null);

  const groupDetailsByProduct = (detalles: HistorialEntregaDetalleItem[]) => {
    const grouped: Record<
      number,
      HistorialEntregaDetalleItem & { total_cantidad_base: number }
    > = {};
    detalles.forEach((d) => {
      const key = d.id_solicitud_reabastecimiento_detalle;
      if (!grouped[key]) {
        grouped[key] = {
          ...d,
          total_cantidad_base: 0,
        };
      }
      grouped[key].total_cantidad_base += Number(d.cantidad_base);
    });
    return Object.values(grouped);
  };

  const handleOpenRecepcion = (
    detallesPendientes: HistorialEntregaDetalleItem[],
    idEntrega: number,
    tipoEntrega: "Solicitud" | "Prestamo",
  ) => {
    setRecepcionData({ idEntrega, detallesPendientes, tipoEntrega });
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
        const uniqueKey = `${h.tipo_entrega}-${h.id_reabastecimiento_entrega}`;
        const expanded = expandedIds[uniqueKey] ?? index === 0;

        const detailsGrouped = groupDetailsByProduct(h.detalles || []);
        const pendientes = (h.detalles || []).filter(
          (d) =>
            d.estado_entrega_detalle === "Entregado" ||
            d.estado_entrega_detalle === "En despacho" ||
            d.estado_entrega_detalle === "Recibido Parcialmente",
        );

        return (
          <Paper
            key={uniqueKey}
            radius="xl"
            className="bg-zinc-900/30 border border-zinc-800/80 transition-all hover:bg-zinc-900/50 relative overflow-hidden p-4"
          >
            <UnstyledButton
              component="div"
              className="w-full"
              onClick={() => toggleExpand(uniqueKey)}
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
                          Préstamo {h.correlativo_prestamo}
                        </Badge>
                      )}
                      <Badge
                        variant="light"
                        color={
                          h.estado === "Recibida" ||
                          h.estado === Estado_SolicitudEntrega.RecepcionCompleta
                            ? "teal"
                            : h.estado === "Procesada" ||
                                h.estado === "Recepcionado Parcialmente" ||
                                h.estado ===
                                  Estado_SolicitudEntrega.RecepcionadoParcialmente
                              ? "orange"
                              : "indigo"
                        }
                        size="xs"
                      >
                        {h.estado === "Recepcionado Parcialmente" ||
                        h.estado ===
                          Estado_SolicitudEntrega.RecepcionadoParcialmente
                          ? "Parcial"
                          : h.estado}
                      </Badge>
                    </Group>
                    <Group gap="xs" className="text-zinc-400 mt-0.5">
                      <BuildingStorefrontIcon className="w-4 h-4 text-indigo-400/70" />
                      <Text size="xs" fw={600} className="italic">
                        {h.almacen_entrega}
                      </Text>
                      <div className="w-1 h-1 rounded-full bg-zinc-700 mx-1" />
                      <CalendarDaysIcon className="w-4 h-4 text-indigo-400/70" />
                      <Text size="xs" fw={600}>
                        {dayjs(h.fecha_hora_entrega).format("DD/MM/YYYY HH:mm")}
                      </Text>
                    </Group>
                  </Stack>
                </Group>
                <Group gap="xs">
                  {pendientes.length > 0 && (
                    <Button
                      size="xs"
                      radius="xl"
                      color="indigo"
                      variant="filled"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRecepcion(
                          pendientes,
                          h.id_reabastecimiento_entrega,
                          h.tipo_entrega,
                        );
                      }}
                    >
                      Registrar stock
                    </Button>
                  )}
                  <div className="w-8 h-8 rounded-full bg-zinc-800/40 flex items-center justify-center border border-zinc-700/50">
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

                <Group gap="xs" mb="sm" mx="md">
                  <CubeIcon className="w-4 h-4 text-indigo-400/70" />
                  <Text
                    size="xs"
                    fw={800}
                    c="zinc.4"
                    className="uppercase tracking-widest"
                  >
                    Productos Entregados
                  </Text>
                </Group>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 pb-2">
                  {detailsGrouped.map((d) => (
                    <div
                      key={d.id_solicitud_reabastecimiento_detalle}
                      className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/40 flex justify-between items-center group/item hover:border-indigo-500/30 transition-colors"
                    >
                      <Stack gap={2}>
                        <Text size="sm" fw={900} className="text-zinc-100">
                          {d.producto}
                        </Text>
                        <Group gap={4}>
                          {d.estado ==
                            Estado_SolicitudEntregaDetalle.EnDespacho ||
                          d.estado ==
                            Estado_SolicitudEntregaDetalle.RecepcionCompleta ? (
                            <Badge
                              size="xs"
                              variant="light"
                              color="teal"
                              leftSection={
                                <CheckBadgeIcon className="w-3 h-3" />
                              }
                            >
                              Recibido
                            </Badge>
                          ) : d.estado_entrega_detalle ===
                              "Recibido Parcialmente" ||
                            d.estado ===
                              Estado_SolicitudEntregaDetalle.RecepcionadoParcialmente ? (
                            <Badge
                              size="xs"
                              variant="light"
                              color="orange"
                              className="font-black"
                            >
                              Parcial:{" "}
                              {formatNumber(
                                d.cantidad_recibida_total_base || 0,
                              )}{" "}
                              {d.estado}
                            </Badge>
                          ) : null}
                        </Group>
                      </Stack>
                      <Stack gap={1} align="flex-end">
                        <Text
                          size="md"
                          fw={900}
                          className="text-emerald-400 font-mono"
                        >
                          +{formatNumber(d.total_cantidad_base)}{" "}
                          <span className="text-xs font-sans">
                            {d.unidad_medida_base_abv}
                          </span>
                        </Text>
                        {d.estado ===
                        Estado_SolicitudEntregaDetalle.RecepcionCompleta ? (
                          <Badge
                            size="xs"
                            variant="dot"
                            color="orange"
                            className="mt-1"
                          >
                            Pendiente
                          </Badge>
                        ) : d.estado_entrega_detalle ===
                            "Recibido Parcialmente" ||
                          d.estado ===
                            Estado_SolicitudEntregaDetalle.RecepcionadoParcialmente ? (
                          <Badge
                            size="xs"
                            variant="dot"
                            color="cyan"
                            className="mt-1"
                          >
                            Faltan{" "}
                            {formatNumber(
                              d.cantidad_base -
                                (d.cantidad_recibida_total_base || 0),
                            )}
                          </Badge>
                        ) : null}
                      </Stack>
                    </div>
                  ))}
                </div>

                {/* Trazabilidad de Recepciones — si hay algo recibido (parcial o total) */}
                {h.detalles?.some(
                  (d) =>
                    d.estado_entrega_detalle === "Recibido" ||
                    d.estado_entrega_detalle === "Entrega confirmada" ||
                    d.estado_entrega_detalle === "Recibido Parcialmente",
                ) && (
                  <div className="px-4 pb-3">
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
                        <Text size="xs" fw={700} c="zinc.4" className="flex-1">
                          Seguimiento de recepciones
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
                        tipoEntrega={h.tipo_entrega}
                      />
                    </Collapse>
                  </div>
                )}
              </div>
            </Collapse>
          </Paper>
        );
      })}
      {/* Modal de Recepción de Entregas */}
      <ModalEstandar
        opened={!!recepcionData}
        close={() => setRecepcionData(null)}
        title={`Almacén ${almacenSolicitante} - Ingreso de Stock`}
        size="70%"
      >
        {recepcionData && (
          <RegistroRecepcion
            idAlmacenSolicitante={idAlmacenSolicitante}
            detalles={recepcionData.detallesPendientes}
            idEntrega={recepcionData.idEntrega}
            tipoEntrega={recepcionData.tipoEntrega}
            onSuccess={async (lotesNuevos?: RES_TicketLote[]) => {
              setRecepcionData(null);
              reload();
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
        )}
      </ModalEstandar>
    </Stack>
  );
};
