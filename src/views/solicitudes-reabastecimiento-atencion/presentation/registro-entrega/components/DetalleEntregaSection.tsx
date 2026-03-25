import { Badge, Group, Text } from "@mantine/core";
import { formatNumber } from "../../../../../presentation/functions/formatNumber";
import type {
  DetalleSolicitudExtendido,
  RES_LoteReabastecimiento,
} from "../../../service/solicitudes-atencion.responses";
import { LotesTable } from "./LotesTable";

interface DetalleEntregaSectionProps {
  detalle: DetalleSolicitudExtendido;
  lotes: RES_LoteReabastecimiento[];
  entregaCantidades: Record<number, number>;
  loadingLotes: boolean;
  handleCantChange: (idLote: number, idProducto: number, val: number) => void;
  handleCantLoteChange: (
    idLote: number,
    idProducto: number,
    val: number,
  ) => void;
}

export const DetalleEntregaSection = ({
  detalle,
  lotes,
  entregaCantidades,
  loadingLotes,
  handleCantChange,
  handleCantLoteChange,
}: DetalleEntregaSectionProps) => {
  const tEntregadoDetalleActualBase = lotes.reduce(
    (acc, l) => acc + (entregaCantidades[l.id_lote] || 0),
    0,
  );

  return (
    <div className="p-5 space-y-5 transition-colors hover:bg-zinc-800/10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <Group gap="xs" wrap="nowrap" align="center" className="pl-1">
          <Badge
            variant="light"
            color="zinc.4"
            size="md"
            className="font-black h-8 bg-zinc-800/30 border border-zinc-700/50"
          >
            {formatNumber(detalle.cantidad_solicitada)}{" "}
            {detalle.unidad_medida_sol_abv}
          </Badge>

          {detalle.unidad_medida_sol_abv !== detalle.unidad_medida_base_abv && (
            <Group gap="xs" wrap="nowrap" className="items-center">
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              <Text
                size="10px"
                c="zinc.5"
                fw={700}
                className="italic uppercase tracking-tight opacity-60 ml-1"
              >
                ({formatNumber(detalle.contenido_por_presentacion)}{" "}
                {detalle.unidad_medida_base_abv} x{" "}
                {detalle.unidad_medida_sol_abv})
              </Text>
              <div className="w-1 h-1 rounded-full bg-zinc-600" />
              <Badge
                variant="light"
                color="indigo.4"
                className="bg-zinc-800/30 font-black h-7"
              >
                {formatNumber(detalle.cantidad_solicitada_base)}{" "}
                {detalle.unidad_medida_base_abv}
              </Badge>
            </Group>
          )}
        </Group>

        <div className="flex items-center gap-2.5 w-full lg:w-auto self-end">
          {/* Pendiente */}
          <div className="flex-1 lg:flex-none flex items-center gap-3 bg-linear-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-2 px-4 shadow-sm min-w-[110px]">
            <div className="flex flex-row gap-1.5">
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
                  size="xs"
                  fw={900}
                  className="text-red-500 font-mono tracking-tighter"
                >
                  {formatNumber(detalle.pendiente_base)}
                </Text>
                <Text
                  size="10px"
                  fw={800}
                  c="zinc.5"
                  className="uppercase opacity-60"
                >
                  {detalle.unidad_medida_base_abv}
                </Text>
              </div>
            </div>
          </div>

          {/* Despachando */}
          <div
            className={`flex-1 lg:flex-none flex items-center gap-3 border border-sky-500/20 rounded-xl p-2 px-4 shadow-sm min-w-[130px] transition-all duration-300 ${
              tEntregadoDetalleActualBase > 0
                ? "bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 shadow-emerald-500/5"
                : "bg-linear-to-br from-indigo-500/5 to-zinc-800/10 border-zinc-800/80 shadow-inner"
            }`}
          >
            <div className="flex flex-row gap-1.5">
              <Text
                size="9px"
                c={tEntregadoDetalleActualBase > 0 ? "emerald.3" : "indigo.4"}
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
                    tEntregadoDetalleActualBase > 0
                      ? "text-emerald-400"
                      : "text-indigo-400/70"
                  }`}
                >
                  {formatNumber(tEntregadoDetalleActualBase)}
                </Text>
                <Text
                  size="10px"
                  fw={800}
                  c="zinc.5"
                  className="uppercase opacity-60"
                >
                  {detalle.unidad_medida_base_abv}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LotesTable
        lotes={lotes}
        idProducto={detalle.id_producto}
        unidadMedidaBaseAbv={detalle.unidad_medida_base_abv}
        entregaCantidades={entregaCantidades}
        pendienteBase={detalle.pendiente_base}
        tEntregadoDetalleActualBase={tEntregadoDetalleActualBase}
        loadingLotes={loadingLotes}
        handleCantChange={handleCantChange}
        handleCantLoteChange={handleCantLoteChange}
      />
    </div>
  );
};
