import { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Paper,
  Badge,
  Loader,
  Collapse,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ClipboardDocumentCheckIcon,
  PaperClipIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import type {
  RES_OrdenCompraRecepcion,
  RES_OrdenCompraRecepcionDetalle,
} from "../../../../service/responses/ordenes-compra/orden-compra-recepcion";
import { OrdenCompraService } from "../../service/orden-compra.service";
import { ArchivoCard } from "../../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../../shared/interfaces/archivo";
import { ModalEstandar } from "../../../../presentation/utils/modal-estandar";
import { RegistrarTransferenciaModal } from "../registro-transferencia/registrar-transferencia-modal";
import { RecepcionHeader } from "./components/RecepcionHeader";
import { RecepcionGrupoDestino } from "./components/RecepcionGrupoDestino";
import { CalendarDaysIcon } from "lucide-react";

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

  const handleTransferenciaSuccess = (resumen?: Record<number, number>) => {
    closeTransferencia();
    if (resumen && selectedRecepcion) {
      setRecepciones((prev) =>
        prev.map((r) => {
          if (r.id_recepcion === selectedRecepcion) {
            return {
              ...r,
              detalles: r.detalles?.map((d) => {
                const adicional = resumen[d.id_recepcion_detalle];
                if (adicional) {
                  return {
                    ...d,
                    cantidad_transferida_base:
                      (d.cantidad_transferida_base || 0) + adicional,
                  };
                }
                return d;
              }),
            };
          }
          return r;
        }),
      );
    }
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

            <RecepcionHeader
              recepcion={r}
              expanded={expanded}
              onToggle={toggleExpand}
            />

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

                    return (
                      <RecepcionGrupoDestino
                        key={idAlmacenDestino}
                        recepcion={r}
                        idAlmacenDestino={idAlmacenDestino}
                        almacenDestino={group.almacen_destino}
                        detalles={group.detalles}
                        onTransfer={(idDestino, dets, nombre) =>
                          handleOpenTransferencia(r, idDestino, dets, nombre)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </Collapse>
          </Paper>
        );
      })}

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
          idRecepcion={selectedRecepcion!}
          idAlmacenDestino={selectedAlmacenDestino!}
          idAlmacenRecepcionista={selectedAlmacenRecepcionista!}
          selectedItemsIds={selectedItemsIds}
          detallesRecepcion={selectedDetalles}
          onSuccess={handleTransferenciaSuccess}
          onCancel={closeTransferencia}
        />
      </ModalEstandar>
    </Stack>
  );
};
