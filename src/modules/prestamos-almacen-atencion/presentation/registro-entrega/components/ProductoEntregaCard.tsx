import { Badge, Group, Paper, Text } from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import { LotesTable } from "./LotesTable";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import type { RES_PrestamoDetalle } from "../../../../../service/responses/prestamos/prestamo";

interface ProductoEntregaCardProps {
  idDetalle: number;
  detalle: RES_PrestamoDetalle;
  lotes: RES_LoteDisponible[];
  loadingLotes: boolean;
  entregaCantidades: Record<number, Record<number, number>>;
  handleCantLoteChange: (
    idDetalle: number,
    idLote: number,
    val: number,
  ) => void;
}

export const ProductoEntregaCard = ({
  idDetalle,
  detalle,
  lotes,
  loadingLotes,
  entregaCantidades,
  handleCantLoteChange,
}: ProductoEntregaCardProps) => {
  const pendienteBase =
    (detalle.cantidad_solicitada_base || 0) -
    (detalle.cantidad_prestada_base || 0);
  const totalDespachadoActualmente = Object.values(
    entregaCantidades[idDetalle] || {},
  ).reduce((sum, val) => sum + (val || 0), 0);

  const ratio = detalle.contenido_por_presentacion || 1;

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
              <CubeIcon className="size-4 text-indigo-400" />
            </div>
            <div>
              <Text
                size="sm"
                fw={800}
                className="text-white tracking-tight leading-tight uppercase italic"
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
              Min: {formatNumber(detalle.stock_minimo_base / ratio)}{" "}
              {detalle.unidad_medida_base_abv}
            </Badge>
            <Badge
              variant="dot"
              color={
                (detalle.stock_disponible_base || 0) <=
                detalle.stock_minimo_base
                  ? "orange"
                  : "teal"
              }
              size="sm"
              className="bg-zinc-800/50 border-zinc-700/50 text-zinc-300 font-bold px-3 py-3 rounded-lg"
            >
              Disponible:{" "}
              {formatNumber((detalle.stock_disponible_base || 0) / ratio)}{" "}
              {detalle.unidad_medida_pr_abv}
            </Badge>
          </Group>
        </div>
      </div>

      <div className="p-5 space-y-5 transition-colors hover:bg-zinc-800/10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <Group gap="xs" wrap="nowrap" align="center" className="pl-1">
            <Badge
              variant="light"
              color="zinc.4"
              size="md"
              className="font-black h-8 bg-zinc-800/30 border border-zinc-700/50 text-white"
            >
              {formatNumber(detalle.cantidad_solicitada)}{" "}
              {detalle.unidad_medida_pr_abv}
            </Badge>
          </Group>

          <div className="flex items-center gap-2.5 w-full lg:w-auto self-end">
            {/* Por Entregar */}
            <div className="flex-1 lg:flex-none flex items-center gap-3 bg-linear-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-2 px-4 shadow-sm min-w-[110px]">
              <div className="flex flex-row gap-1.5 leading-none">
                <Text
                  size="9px"
                  c="red.4"
                  fw={900}
                  className="uppercase self-center"
                >
                  Pendiente
                </Text>
                <div className="flex items-baseline gap-1">
                  <Text
                    size="sm"
                    fw={900}
                    className="text-red-500 font-mono tracking-tighter"
                  >
                    {formatNumber(pendienteBase / ratio)}
                  </Text>
                  <Text
                    size="10px"
                    fw={800}
                    c="zinc.5"
                    className="uppercase opacity-60"
                  >
                    {detalle.unidad_medida_pr_abv}
                  </Text>
                </div>
              </div>
            </div>

            {/* Despachando */}
            <div
              className={`flex-1 lg:flex-none flex items-center gap-3 border border-sky-500/20 rounded-xl p-2 px-4 shadow-sm min-w-[130px] transition-all duration-300 ${
                totalDespachadoActualmente > 0
                  ? "bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 shadow-emerald-500/5"
                  : "bg-linear-to-br from-indigo-500/5 to-zinc-800/10 border-zinc-800/80 shadow-inner"
              }`}
            >
              <div className="flex flex-row gap-1.5 leading-none">
                <Text
                  size="9px"
                  c={totalDespachadoActualmente > 0 ? "emerald.3" : "indigo.4"}
                  fw={900}
                  className="uppercase self-center"
                >
                  Despachando
                </Text>
                <div className="flex items-baseline gap-1">
                  <Text
                    size="sm"
                    fw={900}
                    className={`font-mono tracking-tighter ${
                      totalDespachadoActualmente > 0
                        ? "text-emerald-400"
                        : "text-indigo-400/70"
                    }`}
                  >
                    {formatNumber(totalDespachadoActualmente / ratio)}
                  </Text>
                  <Text
                    size="10px"
                    fw={800}
                    c="zinc.5"
                    className="uppercase opacity-60"
                  >
                    {detalle.unidad_medida_pr_abv}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LotesTable
          idDetalle={idDetalle}
          detalle={detalle}
          lotes={lotes}
          loading={loadingLotes}
          entregaCantidades={entregaCantidades}
          handleCantLoteChange={handleCantLoteChange}
          unidadAbv={detalle.unidad_medida_pr_abv}
          baseAbv={detalle.unidad_medida_base_abv}
          contenidoPorPresentacion={ratio}
        />
      </div>
    </Paper>
  );
};
