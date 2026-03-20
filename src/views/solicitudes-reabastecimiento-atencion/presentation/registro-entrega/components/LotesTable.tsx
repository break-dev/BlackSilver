import { Table } from "@mantine/core";
import { LoteRow } from "./LoteRow";
import type { RES_LoteReabastecimiento } from "../../../service/solicitudes-atencion.responses";

interface LotesTableProps {
  lotes: RES_LoteReabastecimiento[];
  idProducto: number;
  unidadMedidaBaseAbv: string;
  entregaCantidades: Record<number, number>;
  handleCantChange: (idLote: number, idProducto: number, val: number) => void;
}

export const LotesTable = ({
  lotes,
  idProducto,
  unidadMedidaBaseAbv,
  entregaCantidades,
  handleCantChange,
}: LotesTableProps) => {
  return (
    <div className="overflow-hidden border border-zinc-800/60 rounded-2xl bg-zinc-950/30 shadow-inner">
      <Table verticalSpacing="sm" horizontalSpacing="lg" className="border-collapse">
        <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800/60">
          <tr>
            <th className="py-4 pl-6" style={{ width: "25%" }}>
              Lote
            </th>
            <th className="text-center" style={{ width: "20%" }}>
              Vencimiento
            </th>
            <th className="text-center" style={{ width: "25%" }}>
              Stock Almacén
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
                className="py-10 text-center text-zinc-600 italic text-sm font-medium tracking-tight"
              >
                No hay lotes disponibles en este almacén.
              </td>
            </tr>
          ) : (
            lotes.map((lote) => (
              <LoteRow
                key={lote.id_lote}
                lote={lote}
                cant={entregaCantidades[lote.id_lote] || 0}
                idProducto={idProducto}
                unidadMedidaBaseAbv={unidadMedidaBaseAbv}
                handleCantChange={handleCantChange}
              />
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};
