import { useState } from "react";
import {
  Stack,
  Group,
  Text,
  Badge,
  Paper,
  Loader,
  Collapse,
  UnstyledButton,
} from "@mantine/core";
import {
  BuildingStorefrontIcon,
  UserIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentCheckIcon,
  PaperClipIcon,
  CubeIcon,
  ArchiveBoxArrowDownIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useHistorialReposicion } from "../../../hooks/useHistorialReposicion";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import { ArchivoCard } from "../../../../../presentation/utils/archivo/archivo-card";
import type { IArchivo } from "../../../../../shared/interfaces/archivo";
import type {
  RES_PrestamoReposicion,
  RES_PrestamoReposicionDetalle,
} from "../../../../../service/responses/prestamos/prestamo-reposicion";

interface HistorialReposicionesProps {
  idPrestamo: number;
}

export const HistorialReposiciones = ({
  idPrestamo,
}: HistorialReposicionesProps) => {
  const { loading, reposiciones, error } = useHistorialReposicion(idPrestamo);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});

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

  if (error) {
    return (
      <Text c="red" ta="center" className="py-10">
        {error}
      </Text>
    );
  }

  if (reposiciones.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center gap-3">
        <div className="p-4 bg-zinc-900/30 rounded-full border border-zinc-800/50">
          <ArchiveBoxArrowDownIcon className="w-8 h-8 text-zinc-600" />
        </div>
        <Text c="zinc.5" size="sm" fw={600}>
          No se han registrado reposiciones para este préstamo.
        </Text>
      </div>
    );
  }

  return (
    <Stack
      gap="xl"
      className="font-sans pt-2 pb-6 max-h-[70vh] overflow-y-auto px-2"
    >
      {reposiciones.map((repo: RES_PrestamoReposicion, index: number) => {
        const expanded = isExpanded(repo.id_reposicion, index);

        return (
          <Paper
            key={repo.id_reposicion}
            radius="xl"
            className="bg-zinc-900/30 border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all hover:bg-zinc-900/50 hover:border-teal-500/20 group relative overflow-hidden p-4 shrink-0"
          >
            {/* Elemento decorativo superior */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-teal-500/20 via-teal-500/40 to-teal-500/5 group-hover:from-teal-500/40 group-hover:via-teal-500/60 transition-colors" />

            <UnstyledButton
              className="w-full p-5 sm:p-6"
              onClick={() => toggleExpand(repo.id_reposicion)}
            >
              <Group
                justify="space-between"
                align="center"
                wrap="nowrap"
                gap="xl"
              >
                <Group gap="md" wrap="nowrap" className="shrink-0">
                  <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20 group-hover:bg-teal-500/20 transition-colors shrink-0">
                    <ArchiveBoxArrowDownIcon className="w-6 h-6 text-teal-400" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Group gap="xs">
                      <Text
                        size="sm"
                        fw={900}
                        className="text-white tracking-wide"
                      >
                        {repo.correlativo}
                      </Text>
                      <Badge
                        variant="light"
                        color="teal"
                        radius="sm"
                        className="font-bold"
                        size="xs"
                      >
                        {repo.estado}
                      </Badge>
                    </Group>
                    <Group gap="xs" className="text-zinc-400" wrap="nowrap">
                      <Group gap="xs" wrap="nowrap">
                        <CalendarDaysIcon className="w-4 h-4 shrink-0 text-teal-400/70" />
                        <Text size="xs" fw={600} className="whitespace-nowrap">
                          {dayjs(repo.fecha_hora_reposicion).format(
                            "DD/MM/YYYY",
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
                            {repo.registrado_por}
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
                      Almacén de Entrega
                    </Text>
                    <Group gap={6} wrap="nowrap" justify="flex-end">
                      <BuildingStorefrontIcon className="w-4 h-4 text-teal-500/70" />
                      <Text
                        size="sm"
                        fw={800}
                        className="text-zinc-200 truncate max-w-50 lg:max-w-75"
                      >
                        {repo.almacen_entrega}
                      </Text>
                    </Group>
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
                  <ClipboardDocumentCheckIcon className="w-5 h-5 text-teal-400/50 mt-0.5 shrink-0" />
                  <div>
                    <Text
                      size="10px"
                      fw={800}
                      c="zinc.5"
                      className="uppercase tracking-widest mb-1.5"
                    >
                      Observaciones
                    </Text>
                    <Text
                      size="sm"
                      c="zinc.3"
                      className="italic max-w-2xl leading-relaxed"
                    >
                      {repo.observacion ||
                        "Sin observaciones adicionales reportadas durante este proceso de reposición."}
                    </Text>
                  </div>
                </div>

                {/* Sección de Evidencias */}
                {repo.evidencias && repo.evidencias.length > 0 && (
                  <div className="mt-8 pb-4">
                    <Group gap="xs" mb="md" className="pl-1">
                      <PaperClipIcon className="w-4 h-4 text-zinc-500" />
                      <Text
                        size="xs"
                        fw={800}
                        c="zinc.4"
                        className="uppercase tracking-widest"
                      >
                        Evidencias Adjuntas ({repo.evidencias.length})
                      </Text>
                    </Group>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {repo.evidencias.map((ev: IArchivo, idx: number) => (
                        <ArchivoCard
                          key={`${repo.id_reposicion}-ev-${idx}`}
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
                    Productos Repuestos ({repo.detalles?.length || 0})
                  </Text>
                </Group>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-2">
                  {repo.detalles?.map((d: RES_PrestamoReposicionDetalle) => (
                    <div
                      key={d.id_reposicion_detalle}
                      className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/40 hover:border-teal-500/30 transition-colors flex justify-between items-center relative overflow-hidden group/item"
                    >
                      {/* Highlight lateral en hover item */}
                      <div className="absolute left-0 top-0 w-1 h-full bg-teal-500/0 group-hover/item:bg-teal-500/50 transition-colors" />

                      <div className="flex flex-col gap-1.5 pl-2 z-10 w-full pr-4">
                        <Group gap="xs" wrap="nowrap" align="baseline">
                          <CubeIcon className="w-3.5 h-3.5 text-teal-400" />
                          <Text
                            size="sm"
                            fw={900}
                            className="text-white leading-tight"
                          >
                            {d.producto}
                          </Text>
                        </Group>
                        <Text size="10px" c="zinc.5" fw={700} className="pl-5">
                          LOTE: {d.lote_correlativo}
                        </Text>
                      </div>

                      <div className="text-right pl-4 pr-1 border-l border-zinc-800/50 min-w-max z-10 flex flex-col items-end justify-center">
                        <Group gap="xs" wrap="nowrap" align="center">
                          <Text
                            size="md"
                            fw={900}
                            className="text-teal-400 font-mono leading-none"
                          >
                            +{formatNumber(d.cantidad_base)}
                          </Text>
                          <Text
                            size="12px"
                            fw={800}
                            c="zinc.5"
                            className="uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded-md inline-block mr-1"
                          >
                            {d.unidad_medida_base}
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
  );
};
