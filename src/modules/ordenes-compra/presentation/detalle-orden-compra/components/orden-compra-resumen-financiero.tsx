import { Group, Paper, Stack, Text } from "@mantine/core";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type { RES_OrdenCompra } from "../../../../../service/responses/ordenes-compra/orden-compra";

interface OrdenCompraResumenFinancieroProps {
  orden: RES_OrdenCompra;
  symbol: string;
}

export const OrdenCompraResumenFinanciero = ({
  orden,
  symbol,
}: OrdenCompraResumenFinancieroProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 px-2">
      <div className="lg:col-span-8 flex flex-col gap-2">
        <Paper
          p="xs"
          radius="md"
          className="bg-zinc-950/20 border border-zinc-800/50 flex-1"
        >
          <Group gap={4} mb={2}>
            <InformationCircleIcon className="w-3.5 h-3.5 text-zinc-500" />
            <Text
              size="10px"
              fw={800}
              c="zinc.5"
              className="uppercase tracking-widest"
            >
              Observaciones
            </Text>
          </Group>
          <Text size="xs" c="zinc.4" className="italic leading-tight">
            {orden.observacion || "Sin observaciones adicionales."}
          </Text>
        </Paper>

        {(Number(orden.costo_flete) > 0 || Number(orden.otros_gastos) > 0) && (
          <Paper
            p="xs"
            radius="md"
            className="bg-zinc-950/20 border border-zinc-800/50"
          >
            <div className="flex gap-10 px-1">
              <Group gap={4}>
                <Text size="9px" c="zinc.6" fw={700} className="uppercase">
                  Flete:
                </Text>
                <Text size="xs" fw={800} className="text-zinc-300">
                  {symbol} {formatNumber(orden.costo_flete)}
                </Text>
              </Group>
              <Group gap={4}>
                <Text size="9px" c="zinc.6" fw={700} className="uppercase">
                  Otros:
                </Text>
                <Text size="xs" fw={800} className="text-zinc-300">
                  {symbol} {formatNumber(orden.otros_gastos)}
                </Text>
              </Group>
            </div>
          </Paper>
        )}
      </div>

      <Paper
        p="sm"
        radius="lg"
        className="lg:col-span-4 bg-indigo-500/5 border border-indigo-500/20"
      >
        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="10px" c="zinc.5" fw={700} className="uppercase">
              Subtotal
            </Text>
            <Text size="xs" fw={700} className="text-zinc-200 font-mono">
              {symbol} {formatNumber(orden.total_antes_igv)}
            </Text>
          </Group>
          <Group justify="space-between">
            <Text size="10px" c="zinc.5" fw={700} className="uppercase">
              IGV ({orden.porcentaje_igv}%)
            </Text>
            <Text size="xs" fw={700} className="text-zinc-200 font-mono">
              {symbol} {formatNumber(orden.monto_igv)}
            </Text>
          </Group>
          <Group
            justify="space-between"
            className="border-t border-indigo-500/20 pt-1 mt-1"
          >
            <Text size="10px" fw={900} c="indigo.4" className="uppercase">
              Total
            </Text>
            <Text
              size="sm"
              fw={900}
              className="text-white font-mono leading-none"
            >
              {symbol} {formatNumber(orden.total_despues_igv)}
            </Text>
          </Group>
        </Stack>
      </Paper>
    </div>
  );
};
