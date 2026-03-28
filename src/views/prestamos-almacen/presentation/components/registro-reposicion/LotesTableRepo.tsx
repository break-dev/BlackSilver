import { Table, Text } from "@mantine/core";
import { LoteRowRepo } from "./LoteRowRepo";
import type { RES_LoteReabastecimiento } from "../../../../solicitudes-reabastecimiento-atencion/service/solicitudes-atencion.responses";

interface LotesTableRepoProps {
  lotes: RES_LoteReabastecimiento[];
  idDetalle: number;
  unidadMedidaBaseAbv: string;
  reposicionCantidades: Record<number, Record<number, number>>;
  pendienteBase: number;
  loadingLotes: boolean;
  handleUpdateLoteQuantity: (
    idDetalle: number,
    idLote: number,
    valBase: number,
  ) => void;
}

export const LotesTableRepo = ({
  lotes,
  idDetalle,
  unidadMedidaBaseAbv,
  reposicionCantidades,
  pendienteBase,
  loadingLotes,
  handleUpdateLoteQuantity,
}: LotesTableRepoProps) => {
  return (
    <div className="overflow-hidden border border-zinc-800/60 rounded-xl bg-zinc-950/30 shadow-inner">
      <Table
        verticalSpacing="xs"
        horizontalSpacing="md"
        className="border-collapse"
      >
        <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800/60">
          <tr>
            <th className="py-3 px-4 text-center">Lote</th>
            <th className="py-3 text-center">Vencimiento</th>
            <th className="py-3 text-center">Stock</th>
            <th className="py-3 px-4 text-center">Cantidad a Reponer</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40 relative">
          {loadingLotes ? (
            <tr>
              <td colSpan={4} className="py-10 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Text
                    size="xs"
                    fw={800}
                    c="indigo.4"
                    className="uppercase tracking-widest animate-pulse"
                  >
                    Buscando Lotes...
                  </Text>
                </div>
              </td>
            </tr>
          ) : lotes.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-10 text-center text-zinc-600 italic text-xs font-medium tracking-tight"
              >
                No se encontraron lotes para este producto.
              </td>
            </tr>
          ) : (
            lotes.map((lote) => {
              const currentDetailQuantities =
                reposicionCantidades[idDetalle] || {};
              const cantBase = currentDetailQuantities[lote.id_lote] || 0;

              // --- LÓGICA DE STOCK GLOBAL (SESIÓN) ---
              // Calculamos cuánto se ha tomado de este lote en ABSOLUTAMENTE TODOS los detalles
              const stockTotalUsadoDeEsteLote = Object.values(reposicionCantidades)
                .reduce((sum, detailQuants) => {
                  return sum + (detailQuants[lote.id_lote] || 0);
                }, 0);

              // Stock que quedaría físicamente en el almacén después de esta operación
              const stockFisicoRestante = Math.max(
                0,
                lote.stock_actual_base - stockTotalUsadoDeEsteLote,
              );
              
              // Para el "MAX" permitimos lo que ya tomamos + lo que sobra físicamente
              const stockDisponibleParaEsteInput = cantBase + stockFisicoRestante;
              // ---------------------------------------

              // Total ya asignado para este detalle (otros lotes del mismo producto)
              const yaAsignadoEnOtrosLotesDeEsteDetalle = Object.entries(
                currentDetailQuantities,
              )
                .filter(([idL]) => Number(idL) !== lote.id_lote)
                .reduce((sum, [, val]) => sum + val, 0);

              const faltantePorAsignarEnEsteDetalle = Math.max(
                0,
                pendienteBase - yaAsignadoEnOtrosLotesDeEsteDetalle,
              );

              // El máximo que puede poner en este input es el menor entre:
              // 1. Lo que queda del lote (más lo que ya puso en este input)
              // 2. Lo que le falta por reponer en este detalle
              const maxBase = Math.min(
                stockDisponibleParaEsteInput,
                faltantePorAsignarEnEsteDetalle,
              );
              const maxLote = maxBase / (lote.contenido_por_presentacion || 1);

              return (
                <LoteRowRepo
                  key={lote.id_lote}
                  lote={{
                    ...lote,
                    // Mostramos el stock físico real que queda (unificado para todos)
                    stock_actual_base: stockFisicoRestante,
                  }}
                  cantBase={cantBase}
                  idDetalle={idDetalle}
                  unidadMedidaBaseAbv={unidadMedidaBaseAbv}
                  maxBase={maxBase}
                  maxLote={maxLote}
                  handleUpdateLoteQuantity={handleUpdateLoteQuantity}
                />
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};
