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
} from "@heroicons/react/24/outline";
import {
  type RES_ReposicionPrestamo,
  type RES_DetalleReposicionParaRecepcion,
} from "../service/prestamos-atencion.responses";
import { formatNumber } from "../../../presentation/functions/formatNumber";
import { ArchivoCard } from "../../../presentation/utils/archivo-card";
import type { IArchivo } from "../../../shared/interfaces";
import { useNotify } from "../../../hooks/useNotify";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import { RegistroRecepcion } from "./registro-recepcion";
import { ModalEstandar } from "../../../presentation/utils/modal-estandar";

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
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [selectedRepo, setSelectedRepo] =
    useState<RES_ReposicionPrestamo | null>(null);
  const [detailsForReception, setDetailsForReception] = useState<
    RES_DetalleReposicionParaRecepcion[]
  >([]);
  const [openedRecepcion, setOpenedRecepcion] = useState(false);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isExpanded = (id: number, index: number) => {
    if (expandedIds[id] !== undefined) return expandedIds[id];
    return index === 0;
  };

  const handleOpenRecepcion = async (repo: RES_ReposicionPrestamo) => {
    setLoadingDetails(true);
    try {
      const res =
        await PrestamosAtencionService.obtenerDetallesReposicionRecepcion(
          repo.id_reposicion,
        );
      if (res.success) {
        setDetailsForReception(res.data);
        setSelectedRepo(repo);
        setOpenedRecepcion(true);
      }
    } catch {
      notifyError("Error al cargar los detalles para la recepción");
    } finally {
      setLoadingDetails(false);
    }
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
          const isPendingReception = h.estado === "En Despacho";

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
                            h.estado === "Recepcionado" ? "emerald" : "orange"
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
                        loading={
                          loadingDetails &&
                          selectedRepo?.id_reposicion === h.id_reposicion
                        }
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
                        key={d.id}
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
                              +{formatNumber(d.cantidad_solicitud)}
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
              tipoEntrega="Reposicion"
              onSuccess={() => {
                setOpenedRecepcion(false);
                onSuccess();
              }}
            />
          )}
        </div>
      </ModalEstandar>
    </>
  );
};
