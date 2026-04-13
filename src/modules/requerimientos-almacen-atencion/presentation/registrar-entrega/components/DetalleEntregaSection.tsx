import { Badge, Group, Text } from "@mantine/core";
import { formatNumber } from "../../../../../shared/functions/formatNumber";
import type { DetalleRequerimientoExtendido } from "../../../service/atencion.responses";
import { LotesTable } from "./LotesTable";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";

interface DetalleEntregaSectionProps {
  detalle_req: DetalleRequerimientoExtendido;
  lotes: RES_LoteDisponible[];
  index: number;
  entregaCantidades: Record<number, Record<number, number>>;
  handleCantChange: (idDetalle: number, idLote: number, cant: number) => void;
  handleCantLoteChange: (
    idDetalle: number,
    idLote: number,
    cant: number,
  ) => void;
}

export const DetalleEntregaSection = ({
  detalle_req,
  lotes,
  index,
  entregaCantidades,
  handleCantChange,
  handleCantLoteChange,
}: DetalleEntregaSectionProps) => {
  const idDetalleReq = detalle_req.id_requerimiento_almacen_detalle;
  const pendienteBase = detalle_req.pendiente_base;

  const tEntregadoDetalleActualBase = lotes.reduce(
    (acc, l) => acc + (entregaCantidades[idDetalleReq]?.[l.id_lote] || 0),
    0,
  );

  const isFirst = index === 0;

  return (
    <div
      className={`p-5 space-y-5 transition-colors hover:bg-zinc-800/10 ${!isFirst ? "border-t border-zinc-800/40" : ""}`}
    >
      {/* Detail Info Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <Group gap="xs" className="pl-1 flex flex-row">
          <div className="flex flex-row items-center gap-2.5">
            <Text size="sm" fw={800} className="text-zinc-200">
              <span className="text-white font-black">
                {formatNumber(detalle_req.cantidad_solicitada)}{" "}
                {detalle_req.unidad_medida_req_abv}
              </span>
            </Text>
            {detalle_req.producto_destino && (
              <Badge
                size="sm"
                variant="filled"
                color="pink"
                className="font-black px-2 py-3 rounded-lg"
              >
                Para: {detalle_req.producto_destino}
              </Badge>
            )}
          </div>
          {detalle_req.id_unidad_medida_base !==
            detalle_req.id_unidad_medida_req && (
            <Badge
              size="9px"
              variant="transparent"
              c="zinc.5"
              className="font-bold italic"
            >
              Eqv: {formatNumber(detalle_req.cantidad_solicitada_base)}{" "}
              {detalle_req.unidad_medida_base_abv}
            </Badge>
          )}
        </Group>

        <div className="flex items-center gap-2.5 w-full lg:w-auto self-end">
          {/* Por Entregar */}
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
                  {formatNumber(pendienteBase)}
                </Text>
                <Text
                  size="10px"
                  fw={800}
                  c="zinc.5"
                  className="uppercase opacity-60"
                >
                  {detalle_req.unidad_medida_base_abv}
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
                  {detalle_req.unidad_medida_base_abv}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LotesTable
        lotes={lotes}
        idDetalleReq={idDetalleReq}
        pendienteBase={pendienteBase}
        tEntregadoDetalleActualBase={tEntregadoDetalleActualBase}
        entregaCantidades={entregaCantidades}
        detalle_req={detalle_req}
        handleCantChange={handleCantChange}
        handleCantLoteChange={handleCantLoteChange}
      />
    </div>
  );
};
