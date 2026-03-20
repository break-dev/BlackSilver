import { Table } from "@mantine/core";
import { LoteRow } from "./LoteRow";
import type {
  DetalleRequerimientoExtendido,
  RES_Lote,
} from "../../../service/atencion.responses";

interface LotesTableProps {
  lotes: RES_Lote[];
  idDetalleReq: number;
  pendienteBase: number;
  tEntregadoDetalleActualBase: number;
  entregaCantidades: Record<number, Record<number, number>>;
  detalle_req: DetalleRequerimientoExtendido;
  handleCantChange: (idDetalle: number, idLote: number, cant: number) => void;
  handleCantLoteChange: (
    idDetalle: number,
    idLote: number,
    cant: number,
  ) => void;
}

export const LotesTable = ({
  lotes,
  idDetalleReq,
  pendienteBase,
  tEntregadoDetalleActualBase,
  entregaCantidades,
  detalle_req,
  handleCantChange,
  handleCantLoteChange,
}: LotesTableProps) => {
  return (
    <div className="overflow-hidden border border-zinc-800/60 rounded-2xl bg-zinc-950/30 shadow-inner">
      <Table
        verticalSpacing="sm"
        horizontalSpacing="lg"
        className="border-collapse"
      >
        <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800/60">
          <tr>
            <th className="py-4" style={{ width: "25%" }}>
              Lote
            </th>
            <th className="text-center" style={{ width: "20%" }}>
              Vencimiento
            </th>
            <th className="text-center" style={{ width: "25%" }}>
              Stock Disponible
            </th>
            <th className="pr-8 text-center" style={{ width: "30%" }}>
              Cant. a Despachar
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {lotes.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-10 text-center text-zinc-600 italic text-sm font-medium"
              >
                No se encontraron lotes disponibles en este almacén.
              </td>
            </tr>
          ) : (
            lotes.map((lote) => {
              const cant = entregaCantidades[idDetalleReq]?.[lote.id_lote] || 0;

              // Stock real disponible considerando lo asignado a otros detalles en este modal
              const totalOtherItemsForThisLot = Object.entries(
                entregaCantidades,
              ).reduce((sum, [dId, lotesMap]) => {
                if (Number(dId) === idDetalleReq) return sum;
                return sum + (lotesMap[lote.id_lote] || 0);
              }, 0);

              const stockAsignable = Math.max(
                0,
                (lote.stock_actual_base || 0) - totalOtherItemsForThisLot,
              );

              const maxBase = Math.min(
                stockAsignable,
                pendienteBase - (tEntregadoDetalleActualBase - cant),
              );
              const maxLote = maxBase / (lote.contenido_por_presentacion || 1);

              return (
                <LoteRow
                  key={lote.id_lote}
                  lote={lote}
                  idDetalleReq={idDetalleReq}
                  cant={cant}
                  maxBase={maxBase}
                  maxLote={maxLote}
                  detalle_req={detalle_req}
                  stockAsignable={stockAsignable}
                  handleCantChange={handleCantChange}
                  handleCantLoteChange={handleCantLoteChange}
                />
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};
