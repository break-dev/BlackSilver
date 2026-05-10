import { Group, UnstyledButton, Text, Badge, Checkbox } from "@mantine/core";
import {
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  UserIcon,
  DocumentTextIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type { RES_OrdenCompraRecepcion } from "../../../../../service/responses/ordenes-compra/orden-compra-recepcion";

interface Props {
  recepcion: RES_OrdenCompraRecepcion;
  expanded: boolean;
  onToggle: (id: number) => void;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

export const RecepcionHeader = ({
  recepcion,
  expanded,
  onToggle,
  isSelected,
  onSelect,
}: Props) => {
  return (
    <UnstyledButton
      className="w-full p-5 sm:p-6"
      onClick={() => onToggle(recepcion.id_recepcion)}
    >
      <Group justify="space-between" align="center" wrap="nowrap" gap="xl">
        <Group gap="md" wrap="nowrap" className="shrink-0">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shrink-0">
            <CalendarDaysIcon className="w-4 h-4 text-indigo-400" />
          </div>
          {!recepcion.tiene_comprobante && onSelect && (
            <div onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onChange={() => onSelect(recepcion.id_recepcion)}
                color="indigo"
                radius="sm"
                size="xs"
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Group gap="xs">
              <Text size="sm" fw={900} className="text-white tracking-wide">
                Recepción #{recepcion.numero_correlativo}
              </Text>
              <Badge
                variant="light"
                color={
                  recepcion.estado === "Recepción Completa" ? "teal" : "orange"
                }
                radius="sm"
                className="font-bold"
                size="xs"
              >
                {recepcion.estado}
              </Badge>
            </Group>
            <Group gap="xs" className="text-zinc-400" wrap="nowrap">
              <Group gap="xs" wrap="nowrap">
                <CalendarDaysIcon className="w-4 h-4 shrink-0 text-indigo-400/70" />
                <Text size="xs" fw={600} className="whitespace-nowrap">
                  {dayjs(recepcion.fecha_hora_recepcion).format(
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
                    {recepcion.empleado_recepcion}
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
              <Text size="sm" fw={800} className="text-zinc-200 truncate">
                {recepcion.almacen_recepcionista}
              </Text>
            </Group>
          </div>

          {recepcion.guia_remision && (
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
                <Text size="sm" fw={800} className="text-zinc-200 truncate">
                  {recepcion.guia_remision}
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
  );
};
