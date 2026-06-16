import { Badge, Text, Group } from "@mantine/core";
import dayjs from "dayjs";
import { formatNumber } from "../../../../shared/functions/formatNumber";
import type { RES_LoteMineralEnProduccionConsumo } from "../../service/produccion.responses";
import { CalendarIcon } from "@heroicons/react/24/outline";

interface HistorialConsumosProduccionProps {
  consumos: RES_LoteMineralEnProduccionConsumo[];
}

export const HistorialConsumosProduccion = ({
  consumos,
}: HistorialConsumosProduccionProps) => {
  // Group consumos by fecha_consumo
  const groupedByDate = consumos.reduce(
    (acc, consumo) => {
      const fecha = consumo.fecha_consumo;
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(consumo);
      return acc;
    },
    {} as Record<string, RES_LoteMineralEnProduccionConsumo[]>
  );

  const sortedDates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div className="space-y-3">
      {sortedDates.map((fecha) => (
        <div
          key={fecha}
          className="bg-zinc-950/40 border border-zinc-800/60 rounded-xl overflow-hidden hover:border-zinc-700/60 transition-all duration-200"
        >
          {/* Date Header */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/40">
            <div className="p-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <Text size="10px" fw={800} className="uppercase text-indigo-400">
              {dayjs(fecha).format("DD/MM/YYYY")}
            </Text>
            <Badge
              size="xs"
              variant="light"
              color="indigo"
              className="ml-auto font-semibold"
            >
              {groupedByDate[fecha].length} producto{groupedByDate[fecha].length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Consumos List */}
          <div className="divide-y divide-zinc-900">
            {groupedByDate[fecha].map((consumo) => (
              <div
                key={`${consumo.fecha_consumo}-${consumo.id_producto}`}
                className="px-4 py-2.5 hover:bg-white/5 transition-colors duration-150"
              >
                <Group justify="space-between" align="center">
                  <Text size="sm" fw={600} className="text-white flex-1">
                    {consumo.producto}
                  </Text>
                  <Group gap="xs" wrap="nowrap">
                    <Badge
                      variant="filled"
                      color="teal"
                      size="sm"
                      className="font-bold font-mono"
                    >
                      {formatNumber(consumo.total_consumido)} {consumo.unidad_base_abv}
                    </Badge>
                  </Group>
                </Group>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
