import { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Paper,
  Badge,
  Loader,
  UnstyledButton,
  Collapse,
  Button,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  CalendarDaysIcon,
  DocumentTextIcon,
  BuildingStorefrontIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentCheckIcon,
  PaperClipIcon,
  CubeIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type {
  RES_OrdenCompraRecepcion,
  RES_OrdenCompraRecepcionDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra-recepcion";
import { formatNumber } from "../../../shared/functions/formatNumber";
import { OrdenCompraService } from "../service/orden-compra.service";
import { ArchivoCard } from "../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../shared/interfaces/archivo";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";
import { RegistrarTransferenciaModal } from "./registro-transferencia/registrar-transferencia-modal";

interface Props {
  idOrdenCompra: number;
}

export const HistorialRecepcionesOC = ({ idOrdenCompra }: Props) => {
  const [recepciones, setRecepciones] = useState<RES_OrdenCompraRecepcion[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

  const [
    openedTransferencia,
    { open: openTransferencia, close: closeTransferencia },
  ] = useDisclosure(false);
  const [selectedRecepcion, setSelectedRecepcion] = useState<number | null>(
    null,
  );
  const [selectedAlmacenDestino, setSelectedAlmacenDestino] = useState<
    number | null
  >(null);
  const [selectedAlmacenRecepcionista, setSelectedAlmacenRecepcionista] =
    useState<number | null>(null);
  const [selectedAlmacenDestinoNombre, setSelectedAlmacenDestinoNombre] =
    useState<string | null>(null);
  const [
    selectedAlmacenRecepcionistaNombre,
    setSelectedAlmacenRecepcionistaNombre,
  ] = useState<string | null>(null);
  const [selectedItemsIds, setSelectedItemsIds] = useState<number[]>([]);
  const [selectedDetalles, setSelectedDetalles] = useState<
    RES_OrdenCompraRecepcionDetalle[]
  >([]);

  const handleOpenTransferencia = (
    r: RES_OrdenCompraRecepcion,
    idAlmacenDestino: number,
    detalles: RES_OrdenCompraRecepcionDetalle[],
    nombreAlmacen: string,
  ) => {
    setSelectedRecepcion(r.id_recepcion);
    setSelectedAlmacenRecepcionista(r.id_almacen_recepcionista);
    setSelectedAlmacenRecepcionistaNombre(r.almacen_recepcionista);
    setSelectedAlmacenDestino(idAlmacenDestino);
    setSelectedAlmacenDestinoNombre(nombreAlmacen);
    setSelectedItemsIds(detalles.map((d) => d.id_recepcion_detalle));
    setSelectedDetalles(detalles);
    openTransferencia();
  };

  const handleTransferenciaSuccess = () => {
    closeTransferencia();
    setLoading(true);
    OrdenCompraService.getHistorialRecepciones(idOrdenCompra)
      .then((res) => {
        if (res.success && res.data) setRecepciones(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let isMounted = true;
    OrdenCompraService.getHistorialRecepciones(idOrdenCompra)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setRecepciones(res.data);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [idOrdenCompra]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id: number, index: number) => {
    if (expandedIds[id] !== undefined) return expandedIds[id];
    return index === 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader color="indigo" size="lg" />
      </div>
    );
  }

  if (recepciones.length === 0) {
    return (
      <div className="text-center flex flex-col items-center gap-3 py-12">
        <div className="p-4 bg-zinc-900/30 rounded-full border border-zinc-800/50">
          <CalendarDaysIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <Text c="zinc.5" size="sm" fw={600}>
          Aún no se han registrado recepciones para esta orden de compra.
        </Text>
      </div>
    );
  }

  return (
    <Stack
      gap="xl"
      className="font-sans pt-2 pb-6 max-h-[70vh] overflow-y-auto px-2"
    >
      {recepciones.map((r, index) => {
        const expanded = isExpanded(r.id_recepcion, index);

        return (
          <Paper
            key={r.id_recepcion}
            radius="xl"
            className="bg-zinc-900/30 border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all hover:bg-zinc-900/50 hover:border-indigo-500/20 group relative overflow-hidden p-4 shrink-0"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-violet-500/20 via-indigo-500/40 to-indigo-500/5 group-hover:from-violet-500/40 group-hover:via-indigo-500/60 transition-colors" />

            <UnstyledButton
              className="w-full p-5 sm:p-6"
              onClick={() => toggleExpand(r.id_recepcion)}
            >
              <Group
                justify="space-between"
                align="center"
                wrap="nowrap"
                gap="xl"
              >
                <Group gap="md" wrap="nowrap" className="shrink-0">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shrink-0">
                    <CalendarDaysIcon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Group gap="xs">
                      <Text
                        size="sm"
                        fw={900}
                        className="text-white tracking-wide"
                      >
                        Recepción #{r.numero_correlativo}
                      </Text>
                      <Badge
                        variant="light"
                        color={
                          r.estado === "Recepción Completa" ? "teal" : "orange"
                        }
                        radius="sm"
                        className="font-bold"
                        size="xs"
                      >
                        {r.estado}
                      </Badge>
                    </Group>
                    <Group gap="xs" className="text-zinc-400" wrap="nowrap">
                      <Group gap="xs" wrap="nowrap">
                        <CalendarDaysIcon className="w-4 h-4 shrink-0 text-indigo-400/70" />
                        <Text size="xs" fw={600} className="whitespace-nowrap">
                          {dayjs(r.fecha_hora_recepcion).format(
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
                            {r.empleado_recepcion}
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
                  <div className="text-right hidden md:flex flex-col items-end gap-0.5 shrink truncate max-w-[200px]">
                    <Text
                      size="9px"
                      c="zinc.5"
                      fw={800}
                      className="uppercase tracking-widest"
                    >
                      Almacén Recepcionista
                    </Text>
                    <Group gap={6} wrap="nowrap">
                      <BuildingStorefrontIcon className="w-3.5 h-3.5 text-indigo-400/70 shrink-0" />
                      <Text
                        size="sm"
                        fw={800}
                        className="text-zinc-200 truncate"
                      >
                        {r.almacen_recepcionista}
                      </Text>
                    </Group>
                  </div>

                  {r.guia_remision && (
                    <div className="text-right hidden lg:flex flex-col items-end gap-0.5 shrink truncate border-l border-zinc-800/50 pl-4">
                      <Text
                        size="9px"
                        c="zinc.5"
                        fw={800}
                        className="uppercase tracking-widest"
                      >
                        Guía Remisión
                      </Text>
                      <Group gap={6} wrap="nowrap">
                        <DocumentTextIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <Text
                          size="sm"
                          fw={800}
                          className="text-zinc-200 truncate"
                        >
                          {r.guia_remision}
                        </Text>
                      </Group>
                    </div>
                  )}

                  <div className="w-8 h-8 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:bg-zinc-800/80 transition-colors ml-2">
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
                      Observaciones de la Recepción
                    </Text>
                    <Text
                      size="sm"
                      c="zinc.3"
                      className="italic max-w-2xl leading-relaxed"
                    >
                      {r.observacion ||
                        "Sin observaciones adicionales reportadas durante esta recepción."}
                    </Text>
                  </div>
                </div>

                {r.evidencias && r.evidencias.length > 0 && (
                  <div className="mt-8 pb-4">
                    <Group gap="xs" mb="md" className="pl-1">
                      <PaperClipIcon className="w-4 h-4 text-zinc-500" />
                      <Text
                        size="xs"
                        fw={800}
                        c="zinc.4"
                        className="uppercase tracking-widest"
                      >
                        Evidencias de Recepción ({r.evidencias.length})
                      </Text>
                    </Group>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {r.evidencias.map((ev: IArchivo, idx) => (
                        <ArchivoCard
                          key={`${r.id_recepcion}-ev-${idx}`}
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
                    Productos Recibidos ({r.detalles?.length || 0})
                  </Text>
                </Group>

                <div className="flex flex-col gap-4 pb-4">
                  {Object.entries(
                    (r.detalles || []).reduce(
                      (acc, det) => {
                        if (!acc[det.id_almacen_destino]) {
                          acc[det.id_almacen_destino] = {
                            almacen_destino: det.almacen_destino,
                            detalles: [],
                          };
                        }
                        acc[det.id_almacen_destino].detalles.push(det);
                        return acc;
                      },
                      {} as Record<
                        number,
                        {
                          almacen_destino: string;
                          detalles: NonNullable<typeof r.detalles>;
                        }
                      >,
                    ),
                  ).map(([idAlmacenDestinoStr, group]) => {
                    const idAlmacenDestino = Number(idAlmacenDestinoStr);
                    const requiresTransfer =
                      idAlmacenDestino !== r.id_almacen_recepcionista;

                    return (
                      <div
                        key={idAlmacenDestino}
                        className="border border-zinc-800/50 rounded-2xl overflow-hidden bg-zinc-900/20"
                      >
                        {requiresTransfer && (
                          <div className="bg-indigo-500/10 px-4 py-2 border-b border-indigo-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <Group gap="xs">
                              <ArrowRightEndOnRectangleIcon className="w-5 h-5 text-indigo-400" />
                              <Text size="xs" fw={800} c="indigo.3">
                                Transferir a {group.almacen_destino}
                              </Text>
                            </Group>
                            <Button
                              size="xs"
                              variant="light"
                              color="indigo"
                              radius="xl"
                              onClick={() =>
                                handleOpenTransferencia(
                                  r,
                                  idAlmacenDestino,
                                  group.detalles,
                                  group.almacen_destino,
                                )
                              }
                            >
                              Transferir Stock
                            </Button>
                          </div>
                        )}
                        <div className="p-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {group.detalles.map((det) => (
                            <div
                              key={det.id_recepcion_detalle}
                              className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/40 hover:border-indigo-500/30 transition-colors flex justify-between items-center relative overflow-hidden group/item"
                            >
                              <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/0 group-hover/item:bg-indigo-500/50 transition-colors" />

                              <div className="flex flex-col gap-1.5 pl-2 z-10 w-full pr-4">
                                <Text
                                  size="sm"
                                  fw={900}
                                  className="text-white leading-tight"
                                >
                                  {det.producto}
                                </Text>

                                <Group gap="xs" wrap="nowrap" align="center">
                                  <CubeIcon className="w-3.5 h-3.5 text-indigo-400" />
                                  <Text
                                    size="11px"
                                    fw={800}
                                    c="zinc.4"
                                    className="uppercase tracking-widest leading-none"
                                  >
                                    Recibido:
                                  </Text>
                                  <Badge
                                    variant="light"
                                    color="indigo"
                                    size="sm"
                                    className="font-bold tracking-wider"
                                  >
                                    {formatNumber(det.cantidad_recepcionada)}{" "}
                                    {det.unidad_medida_oc_abv}
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
                                    +
                                    {formatNumber(
                                      det.cantidad_recepcionada_base,
                                    )}
                                  </Text>
                                  <Text
                                    size="12px"
                                    fw={800}
                                    c="zinc.5"
                                    className="uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded-md inline-block mr-1"
                                  >
                                    {det.unidad_medida_base_abv || "UNI"}
                                  </Text>
                                </Group>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Collapse>
          </Paper>
        );
      })}

      {selectedRecepcion !== null &&
        selectedAlmacenDestino !== null &&
        selectedAlmacenRecepcionista !== null && (
          <ModalEstandar
            opened={openedTransferencia}
            close={closeTransferencia}
            title={`Transferir a ${selectedAlmacenDestinoNombre || ""}`}
            size="75%"
            rightSection={
              <Badge variant="dot" color="indigo" size="sm" radius="sm">
                Origen: {selectedAlmacenRecepcionistaNombre || ""}
              </Badge>
            }
          >
            <RegistrarTransferenciaModal
              idRecepcion={selectedRecepcion}
              idAlmacenDestino={selectedAlmacenDestino}
              idAlmacenRecepcionista={selectedAlmacenRecepcionista}
              selectedItemsIds={selectedItemsIds}
              detallesRecepcion={selectedDetalles}
              onSuccess={handleTransferenciaSuccess}
              onCancel={closeTransferencia}
            />
          </ModalEstandar>
        )}
    </Stack>
  );
};
