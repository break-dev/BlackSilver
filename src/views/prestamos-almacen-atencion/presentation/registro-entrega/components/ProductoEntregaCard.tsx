import { Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import { LotesTable } from "./LotesTable";
import type { RES_DetallePrestamo, RES_Lote_Atencion } from "../../../service/prestamos-atencion.responses";

interface ProductoEntregaCardProps {
  idDetalle: number;
  detalle: RES_DetallePrestamo;
  lotes: RES_Lote_Atencion[];
  loadingLotes: boolean;
  entregaCantidades: Record<number, Record<number, number>>;
  handleCantLoteChange: (idDetalle: number, idLote: number, val: number) => void;
}

export const ProductoEntregaCard = ({
  idDetalle,
  detalle,
  lotes,
  loadingLotes,
  entregaCantidades,
  handleCantLoteChange,
}: ProductoEntregaCardProps) => {
  const stockTotalDetalle = lotes.reduce((acc, l) => acc + (l.stock_actual_base || 0), 0);
  const pendienteBase = (detalle.cantidad_solicitada_base || 0) - (detalle.cantidad_prestada_base || 0);
  const totalDespachadoActualmente = Object.values(entregaCantidades[idDetalle] || {}).reduce((sum, val) => sum + (val || 0), 0);
  
  const ratio = detalle.contenido_por_presentacion || 1;

  return (
    <Paper shadow="md" radius="2xl" className="bg-zinc-900/30 border border-zinc-800/80 overflow-hidden relative shadow-2xl">
      {/* Product Header Section */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/50 p-6 px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-linear-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 shadow-inner">
              <CubeIcon className="w-5 h-5 text-indigo-400" />
            </div>
            <Stack gap={0}>
                <Text size="md" fw={900} className="text-white tracking-tight leading-tight uppercase italic">{detalle.producto}</Text>
                <Text size="xs" fw={900} className="text-zinc-500 uppercase tracking-widest leading-none mt-1">{detalle.unidad_medida}</Text>
            </Stack>
          </div>

          <Group gap="sm">
            <Badge variant="dot" color="amber" size="lg" className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 font-bold px-4 py-4 rounded-xl">
               Pendiente: {formatNumber(pendienteBase / ratio)} {detalle.unidad_medida_abv}
            </Badge>
            <Badge variant="dot" color={stockTotalDetalle < pendienteBase ? 'red' : 'indigo'} size="lg" className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 font-bold px-4 py-4 rounded-xl">
               Existencias: {formatNumber(stockTotalDetalle / ratio)} {detalle.unidad_medida_abv}
            </Badge>
            <Badge variant="filled" color={totalDespachadoActualmente > 0 ? 'emerald' : 'zinc'} size="lg" className="font-mono font-black border-zinc-700/50 px-4 py-4 rounded-xl shadow-xl">
               + {formatNumber(totalDespachadoActualmente / ratio)}
            </Badge>
          </Group>
        </div>
      </div>

      <div className="p-6 bg-zinc-950/20">
        <LotesTable 
          idDetalle={idDetalle}
          lotes={lotes}
          loading={loadingLotes}
          entregaCantidades={entregaCantidades}
          handleCantLoteChange={handleCantLoteChange}
          unidadAbv={detalle.unidad_medida_abv}
          contenidoPorPresentacion={ratio}
        />
      </div>
    </Paper>
  );
};
