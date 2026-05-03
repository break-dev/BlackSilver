import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import type { RES_OrdenCompra } from "../../../../../service/responses/ordenes-compra/orden-compra";

interface OrdenCompraInfoAdicionalProps {
  orden: RES_OrdenCompra;
}

export const OrdenCompraInfoAdicional = ({
  orden,
}: OrdenCompraInfoAdicionalProps) => {
  return (
    <Paper
      p="md"
      radius="lg"
      bg="transparent"
      className="border border-zinc-800/50 mx-2"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stack gap={4}>
          <Text
            size="xs"
            c="zinc.5"
            fw={800}
            className="uppercase tracking-widest"
          >
            Estado de Orden
          </Text>
          <Badge
            color="indigo"
            variant="light"
            size="sm"
            radius="sm"
            className="font-bold border border-indigo-900/30"
          >
            {orden.estado}
          </Badge>
        </Stack>

        <Stack gap={4}>
          <Group gap={6}>
            <BanknotesIcon className="w-3.5 h-3.5 text-emerald-500" />
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Forma de Pago
            </Text>
          </Group>
          <Text size="sm" fw={800} className="text-zinc-100 italic">
            {orden.metodo_pago}
          </Text>
        </Stack>

        <Stack gap={4}>
          <Group gap={6}>
            <CurrencyDollarIcon className="w-3.5 h-3.5 text-cyan-500" />
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Moneda
            </Text>
          </Group>
          <Text size="sm" fw={800} className="text-zinc-100 italic">
            {orden.moneda}
          </Text>
        </Stack>

        <Stack gap={4}>
          <Group gap={6}>
            <DocumentTextIcon className="w-3.5 h-3.5 text-amber-500" />
            <Text
              size="xs"
              c="zinc.5"
              fw={800}
              className="uppercase tracking-widest"
            >
              Referencia
            </Text>
          </Group>
          <Badge variant="light" color="yellow" radius="sm" size="sm">
            {orden.correlativo_cotizacion || "Sin Ref."}
          </Badge>
        </Stack>
      </div>
    </Paper>
  );
};
