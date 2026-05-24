import { Badge, Group, Paper, Text } from "@mantine/core";
import { CubeIcon } from "@heroicons/react/24/outline";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import { LotesTableTransferencia } from "./LotesTableTransferencia";
import { ActivosTableTransferencia } from "./ActivosTableTransferencia";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import type { RES_OrdenCompraRecepcionDetalle } from "../../../../../service/responses/ordenes-compra/orden-compra-recepcion";
import type { RES_ActivoFijoDisponible } from "../../../../../service/responses/activo-fijo";
import { TipoBien } from "../../../../../shared/enums/_generic/tipo-bien";

interface ProductoTransferenciaCardProps {
  idDetalle: number;
  detalle: RES_OrdenCompraRecepcionDetalle;
  lotes: RES_LoteDisponible[];
  activosFijos: RES_ActivoFijoDisponible[];
  loadingLotes: boolean;
  transferenciaCantidades: Record<number, Record<number, number>>;
  transferenciaCantidadesActivos: Record<number, Record<number, number>>;
  handleCantLoteChange: (
    idDetalle: number,
    idLote: number,
    val: number,
  ) => void;
  handleCantActivoChange: (
    idDetalle: number,
    idActivo: number,
    val: number,
  ) => void;
}

export const ProductoTransferenciaCard = ({
  idDetalle,
  detalle,
  lotes,
  activosFijos,
  loadingLotes,
  transferenciaCantidades,
  transferenciaCantidadesActivos,
  handleCantLoteChange,
  handleCantActivoChange,
}: ProductoTransferenciaCardProps) => {
  const isActivo = detalle.tipo_bien === TipoBien.ActivoFijo;
  const totalRecepcionadoBase = detalle.cantidad_recepcionada_base || 0;

  const totalTransfiriendoActualmenteBase = isActivo
    ? Object.values(transferenciaCantidadesActivos[idDetalle] || {}).reduce(
        (sum, val) => sum + (val || 0),
        0,
      )
    : Object.values(transferenciaCantidades[idDetalle] || {}).reduce(
        (sum, val) => sum + (val || 0),
        0,
      );

  const ratio =
    detalle.cantidad_recepcionada > 0
      ? detalle.cantidad_recepcionada_base / detalle.cantidad_recepcionada
      : 1;
  const totalRecepcionadoPresentacion = totalRecepcionadoBase / ratio;
  const totalTransfiriendoPresentacion =
    totalTransfiriendoActualmenteBase / ratio;

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
                size="sm"
                fw={800}
                className="text-white tracking-tight leading-tight uppercase italic"
              >
                {detalle.producto}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 transition-colors hover:bg-zinc-800/10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <Group gap="xs" wrap="nowrap" align="center" className="pl-1">
            <Text size="xs" fw={700} c="zinc.5">
              Por transferir:
            </Text>
            <Badge
              variant="light"
              color="zinc.4"
              size="md"
              className="font-black h-8 bg-zinc-800/30 border border-zinc-700/50 text-white"
            >
              {formatNumber(totalRecepcionadoPresentacion)}{" "}
              {detalle.unidad_medida_oc_abv}
            </Badge>
          </Group>

          <div className="flex items-center gap-2.5 w-full lg:w-auto self-end">
            <div
              className={`flex-1 lg:flex-none flex items-center gap-3 border border-sky-500/20 rounded-xl p-2 px-4 shadow-sm min-w-[130px] transition-all duration-300 ${
                totalTransfiriendoPresentacion > 0
                  ? "bg-linear-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30 shadow-emerald-500/5"
                  : "bg-linear-to-br from-indigo-500/5 to-zinc-800/10 border-zinc-800/80 shadow-inner"
              }`}
            >
              <div className="flex flex-row gap-1.5 leading-none">
                <Text
                  size="9px"
                  c={
                    totalTransfiriendoPresentacion > 0
                      ? "emerald.3"
                      : "indigo.4"
                  }
                  fw={900}
                  className="uppercase self-center"
                >
                  Transfiriendo
                </Text>
                <div className="flex items-baseline gap-1">
                  <Text
                    size="sm"
                    fw={900}
                    className={`font-mono tracking-tighter ${
                      totalTransfiriendoPresentacion > 0
                        ? "text-emerald-400"
                        : "text-indigo-400/70"
                    }`}
                  >
                    {formatNumber(totalTransfiriendoPresentacion)}
                  </Text>
                  <Text
                    size="10px"
                    fw={800}
                    c="zinc.5"
                    className="uppercase opacity-60"
                  >
                    {detalle.unidad_medida_oc_abv}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isActivo ? (
          <ActivosTableTransferencia
            idDetalle={idDetalle}
            activosFijos={activosFijos}
            transferenciaCantidadesActivos={transferenciaCantidadesActivos}
            handleCantActivoChange={handleCantActivoChange}
          />
        ) : (
          <LotesTableTransferencia
            idDetalle={idDetalle}
            detalle={detalle}
            lotes={lotes}
            loading={loadingLotes}
            transferenciaCantidades={transferenciaCantidades}
            handleCantLoteChange={handleCantLoteChange}
            unidadAbv={detalle.unidad_medida_oc_abv}
            baseAbv={detalle.unidad_medida_base_abv}
            contenidoPorPresentacion={ratio}
            cantidadMaximaTransferirBase={totalRecepcionadoBase}
          />
        )}
      </div>
    </Paper>
  );
};
