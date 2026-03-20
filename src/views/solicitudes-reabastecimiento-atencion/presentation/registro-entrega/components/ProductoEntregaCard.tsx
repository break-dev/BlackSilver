import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type {
  RES_LoteReabastecimiento,
  DetalleSolicitudExtendido,
} from "../../../service/solicitudes-atencion.responses";
import { DetalleEntregaSection } from "./DetalleEntregaSection";

interface ProductoEntregaCardProps {
  detalle: DetalleSolicitudExtendido;
  lotes: RES_LoteReabastecimiento[];
  entregaCantidades: Record<number, number>;
  loadingLotes: boolean;
  handleCantChange: (idLote: number, idProducto: number, val: number) => void;
  handleCantLoteChange: (idLote: number, idProducto: number, val: number) => void;
}

export const ProductoEntregaCard = ({
  detalle,
  lotes,
  entregaCantidades,
  loadingLotes,
  handleCantChange,
  handleCantLoteChange,
}: ProductoEntregaCardProps) => {
  return (
    <Paper
      shadow="md"
      radius="lg"
      className="bg-zinc-900/30 border border-zinc-800/80 overflow-hidden relative"
    >
      <div className="bg-zinc-900/60 border-b border-zinc-800/50 p-4 px-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 shadow-inner">
              <CubeIcon className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <Text
                size="md"
                fw={900}
                className="text-white tracking-tight leading-tight"
              >
                {detalle.producto}
              </Text>
            </div>
          </div>

          <Group gap="sm">
            <Badge
              variant="dot"
              color="zinc.5"
              size="sm"
              className="bg-zinc-800/50 border-zinc-700/50 text-zinc-400 font-bold px-3 py-3 rounded-lg"
            >
              Min: {formatNumber(detalle.stock_minimo)}{" "}
              {detalle.unidad_medida_base_abv}
            </Badge>
            <Badge
              variant="dot"
              color={
                detalle.stock_disponible <= detalle.stock_minimo ? "orange" : "teal"
              }
              size="sm"
              className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 font-bold px-3 py-3 rounded-lg"
            >
              Disponible: {formatNumber(detalle.stock_disponible)}{" "}
              {detalle.unidad_medida_base_abv}
            </Badge>
          </Group>
        </div>
      </div>

      <Stack gap="0">
        <DetalleEntregaSection
          detalle={detalle}
          lotes={lotes}
          entregaCantidades={entregaCantidades}
          loadingLotes={loadingLotes}
          handleCantChange={handleCantChange}
          handleCantLoteChange={handleCantLoteChange}
        />
      </Stack>
    </Paper>
  );
};
