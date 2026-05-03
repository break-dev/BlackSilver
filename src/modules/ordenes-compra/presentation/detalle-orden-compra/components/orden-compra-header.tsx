import { Group, Paper, Stack, Text } from "@mantine/core";
import {
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import type { RES_OrdenCompra } from "../../../../../service/responses/ordenes-compra/orden-compra";

interface OrdenCompraHeaderProps {
  orden: RES_OrdenCompra;
}

export const OrdenCompraHeader = ({ orden }: OrdenCompraHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
      <Paper
        p="md"
        radius="lg"
        className="bg-violet-500/6 border border-violet-500/20 relative overflow-hidden group hover:bg-violet-500/10 transition-all"
      >
        <CheckBadgeIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-violet-400/10 rotate-12 group-hover:scale-110 transition-transform" />
        <Stack gap={2} className="relative z-10">
          <Group gap={6}>
            <CheckBadgeIcon className="w-4 h-4 text-violet-400" />
            <Text
              size="xs"
              c="violet.3"
              fw={800}
              className="uppercase tracking-widest"
            >
              Cód. Orden
            </Text>
          </Group>
          <Text
            size="md"
            fw={900}
            className="text-zinc-100 tracking-tight leading-tight font-mono"
          >
            {orden.correlativo}
          </Text>
        </Stack>
      </Paper>

      <Paper
        p="md"
        radius="lg"
        className="bg-indigo-500/6 border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-500/10 transition-all"
      >
        <BuildingStorefrontIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-indigo-400/10 rotate-12 group-hover:scale-110 transition-transform" />
        <Stack gap={2} className="relative z-10">
          <Group gap={6}>
            <BuildingStorefrontIcon className="w-4 h-4 text-indigo-500" />
            <Text
              size="xs"
              c="indigo.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Empresa
            </Text>
          </Group>
          <Text
            size="sm"
            fw={800}
            className="text-zinc-100 tracking-tight leading-tight line-clamp-1"
          >
            {orden.empresa}
          </Text>
        </Stack>
      </Paper>

      <Paper
        p="md"
        radius="lg"
        className="bg-amber-500/6 border border-amber-500/20 relative overflow-hidden group hover:bg-amber-500/10 transition-all"
      >
        <UserIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-400/10 rotate-12 group-hover:scale-110 transition-transform" />
        <Stack gap={2} className="relative z-10">
          <Group gap={6}>
            <UserIcon className="w-4 h-4 text-amber-500" />
            <Text
              size="xs"
              c="amber.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Proveedor
            </Text>
          </Group>
          <Text
            size="sm"
            fw={800}
            className="text-zinc-100 tracking-tight leading-tight line-clamp-1"
          >
            {orden.proveedor}
          </Text>
        </Stack>
      </Paper>

      <Paper
        p="md"
        radius="lg"
        className="bg-zinc-500/6 border border-zinc-500/20 relative overflow-hidden group hover:bg-zinc-500/10 transition-all"
      >
        <ClockIcon className="absolute -right-2 -bottom-2 w-16 h-16 text-zinc-400/10 rotate-12 group-hover:scale-110 transition-transform" />
        <Stack gap={2} className="relative z-10">
          <Group gap={6}>
            <ClockIcon className="w-4 h-4 text-zinc-500" />
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Fecha Emisión
            </Text>
          </Group>
          <Text
            size="md"
            fw={800}
            className="text-zinc-100 tracking-tight leading-tight font-mono"
          >
            {dayjs(orden.fecha_hora_orden).format("DD/MM/YYYY")}
          </Text>
        </Stack>
      </Paper>
    </div>
  );
};
