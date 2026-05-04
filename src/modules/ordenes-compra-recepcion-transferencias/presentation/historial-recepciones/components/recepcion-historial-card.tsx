import {
  Badge,
  Collapse,
  Group,
  Paper,
  Stack,
  Text,
  UnstyledButton,
  Table,
} from "@mantine/core";
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  CubeIcon,
  PaperClipIcon,
  UserIcon,
  DocumentTextIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import { ArchivoCard } from "../../../../../presentation/utils/archivo/archivo-card";
import type { RES_OCTransRecepcion } from "../../../../../service/responses/ordenes-compra/orden-compra-transferencia-recepcion";

interface Props {
  recepcion: RES_OCTransRecepcion;
  index: number;
  totalCount: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const RecepcionHistorialCard = ({
  recepcion,
  index,
  totalCount,
  isExpanded,
  onToggle,
}: Props) => {
  const totalItems = recepcion.detalles?.length || 0;

  return (
    <Paper
      radius="xl"
      className="bg-zinc-900/30 border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all hover:bg-zinc-900/50 hover:border-indigo-500/20 group relative overflow-hidden p-4 shrink-0"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-violet-500/20 via-indigo-500/40 to-indigo-500/5 group-hover:from-violet-500/40 group-hover:via-indigo-500/60 transition-colors" />

      {/* HEADER */}
      <UnstyledButton className="w-full p-2 sm:p-3" onClick={onToggle}>
        <Group justify="space-between" align="center" wrap="nowrap" gap="xl">
          <Group gap="md" wrap="nowrap" className="shrink-0">
            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shrink-0">
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex flex-col gap-1">
              <Group gap="xs">
                <Text size="sm" fw={900} className="text-white tracking-wide">
                  Recepción #{totalCount - index}
                </Text>
                {recepcion.con_incidencia && (
                  <Badge color="red" variant="filled" size="xs" radius="sm" className="bg-red-500/20 text-red-300 border border-red-500/30 font-bold uppercase">
                    INCIDENCIA
                  </Badge>
                )}
              </Group>
              <Group gap="xs" className="text-zinc-400" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <CalendarDaysIcon className="w-4 h-4 shrink-0 text-indigo-400/70" />
                  <Text size="xs" fw={600} className="whitespace-nowrap">
                    {dayjs(recepcion.fecha_hora_recepcion).format("DD/MM/YYYY HH:mm")}
                  </Text>
                </Group>
                <Group
                  gap="xs"
                  className="bg-zinc-950/50 px-2.5 py-1 rounded-md border border-zinc-800/60 ml-1 shrink-0 hidden sm:flex"
                  wrap="nowrap"
                >
                  <UserIcon className="w-3 h-3 text-zinc-400" />
                  <Text size="10px" fw={700} c="zinc.4" className="whitespace-nowrap">
                    Por: <span className="text-zinc-300">{recepcion.empleado_registro}</span>
                  </Text>
                </Group>
                <Group gap="xs" wrap="nowrap" className="hidden sm:flex">
                  <CubeIcon className="w-4 h-4 shrink-0 text-zinc-500" />
                  <Text size="xs" fw={600} className="whitespace-nowrap text-zinc-400">
                    {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
                  </Text>
                </Group>
              </Group>
            </div>
          </Group>

          <Group gap="lg" wrap="nowrap" justify="flex-end" className="flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-800/40 flex items-center justify-center shrink-0 border border-zinc-700/50 group-hover:bg-zinc-800/80 transition-colors ml-2">
              {isExpanded ? (
                <ChevronUpIcon className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 text-zinc-400" />
              )}
            </div>
          </Group>
        </Group>
      </UnstyledButton>

      {/* BODY */}
      <Collapse in={isExpanded}>
        <div className="px-5 pt-4 border-t border-zinc-800/30">
          <Stack gap="lg">
            {/* Observación */}
            {recepcion.observacion && (
              <div className={`bg-zinc-950/40 rounded-xl p-4 border flex gap-3 items-start shadow-inner ${recepcion.con_incidencia ? "border-red-500/20" : "border-zinc-800/40"}`}>
                <div>
                  <Text size="10px" fw={800} c="zinc.5" className="uppercase tracking-widest mb-1.5">
                    Observaciones
                  </Text>
                  <Text size="sm" c="zinc.3" className="italic max-w-2xl leading-relaxed">
                    "{recepcion.observacion}"
                  </Text>
                </div>
              </div>
            )}

            {/* Evidencias */}
            {recepcion.evidencias && recepcion.evidencias.length > 0 && (
              <div className="mt-2">
                <Group gap="xs" mb="md" className="pl-1">
                  <PaperClipIcon className="w-4 h-4 text-zinc-500" />
                  <Text size="xs" fw={800} c="zinc.4" className="uppercase tracking-widest">
                    Evidencias ({recepcion.evidencias.length})
                  </Text>
                </Group>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recepcion.evidencias.map((ev, i) => (
                    <ArchivoCard key={i} archivo={ev} />
                  ))}
                </div>
              </div>
            )}

            {/* Productos */}
            {recepcion.detalles && recepcion.detalles.length > 0 && (
              <div className="pb-4">
                <Group gap="xs" mb="sm" className="pl-1">
                  <DocumentTextIcon className="w-4 h-4 text-zinc-500" />
                  <Text size="xs" fw={800} c="zinc.4" className="uppercase tracking-widest">
                    Items Recibidos
                  </Text>
                </Group>
                
                <div className="bg-zinc-950/60 rounded-2xl border border-zinc-800/40 overflow-hidden">
                  <Table verticalSpacing="sm" horizontalSpacing="md">
                    <thead className="bg-zinc-900/80 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">Producto</th>
                        <th className="px-4 py-3 text-center">Estado</th>
                        <th className="px-4 py-3 text-right">Cant. Recibida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {recepcion.detalles.map((d) => (
                        <tr key={d.id_recepcion_detalle} className="hover:bg-zinc-900/40 transition-colors">
                          <td className="px-4 py-3">
                            <Text size="sm" fw={700} className="text-zinc-200">
                              {d.producto}
                            </Text>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              color={d.estado === "Recepción Completa" ? "green" : "orange"}
                              variant="light"
                              size="xs"
                              radius="sm"
                              className="font-bold uppercase"
                            >
                              {d.estado}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Group gap={4} justify="flex-end" wrap="nowrap">
                              <Text size="sm" fw={900} className="text-white font-mono">
                                +{formatNumber(d.cantidad_recepcionada_base)}
                              </Text>
                              <Text size="xs" fw={800} c="zinc.5" className="uppercase">
                                {d.unidad_medida_base_abv}
                              </Text>
                            </Group>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </Stack>
        </div>
      </Collapse>
    </Paper>
  );
};
