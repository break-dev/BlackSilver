import { Table, Text } from "@mantine/core";
import { LoteRow } from "./LoteRow";
import type { RES_LoteDisponible } from "../../../../../service/responses/lote-producto";
import { JsonScanner } from "../../../../../presentation/utils/JsonScanner";
import { useJsonScanner } from "../../../../../hooks/useJsonScanner";

interface LotesTableProps {
  lotes: RES_LoteDisponible[];
  idSolicitudDetalle: number;
  unidadMedidaBaseAbv: string;
  entregaCantidades: Record<number, Record<number, number>>;
  pendienteBase: number;
  tEntregadoDetalleActualBase: number;
  loadingLotes: boolean;
  handleCantChange: (
    idSolicitudDetalle: number,
    idLote: number,
    val: number,
  ) => void;
  handleCantLoteChange: (
    idSolicitudDetalle: number,
    idLote: number,
    val: number,
  ) => void;
}

export const LotesTable = ({
  lotes,
  idSolicitudDetalle,
  unidadMedidaBaseAbv,
  entregaCantidades,
  pendienteBase,
  tEntregadoDetalleActualBase,
  loadingLotes,
  handleCantChange,
  handleCantLoteChange,
}: LotesTableProps) => {
  const { isFiltering, clearFilter, handleScanned, filterItems } = useJsonScanner();
  const lotesVisibles = filterItems(lotes, "id_lote");

  return (
    <div className="overflow-hidden border border-zinc-800/60 rounded-2xl bg-zinc-950/30 shadow-inner">
      {/* Barra de escaneo QR */}
      <div className="flex justify-end px-4 py-2 border-b border-zinc-800/40 bg-zinc-900/30">
        <JsonScanner
          fields={["id"]}
          onScanned={handleScanned}
          isFiltering={isFiltering}
          onClearFilter={clearFilter}
          filteredCount={lotesVisibles.length}
        />
      </div>

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
        <tbody className="divide-y divide-zinc-800/40 relative">
          {loadingLotes ? (
            <tr>
              <td colSpan={4} className="py-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/10 animate-pulse" />
                    </div>
                  </div>
                  <Text
                    size="xs"
                    fw={800}
                    className="text-indigo-400 uppercase tracking-widest animate-pulse"
                  >
                    Buscando Lotes...
                  </Text>
                </div>
              </td>
            </tr>
          ) : lotesVisibles.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-10 text-center text-zinc-600 italic text-sm font-medium tracking-tight"
              >
                {isFiltering
                  ? "Ningún lote escaneado coincide con los disponibles."
                  : "No se encontraron lotes disponibles en este almacén."}
              </td>
            </tr>
          ) : (
            lotesVisibles.map((lote) => {
              const currentDetailQuantities =
                entregaCantidades[idSolicitudDetalle] || {};
              const cant = currentDetailQuantities[lote.id_lote] || 0;

              const totalAsignadoGlobal = Object.entries(
                entregaCantidades,
              ).reduce(
                (sum, [, lotesMap]) => sum + (lotesMap[lote.id_lote] || 0),
                0,
              );

              const stockRestanteGlobal = Math.max(
                0,
                lote.stock_actual_base - totalAsignadoGlobal,
              );

              const totalEnOtrosDetalles = totalAsignadoGlobal - cant;
              const stockDisponibleParaEsteDetalle =
                lote.stock_actual_base - totalEnOtrosDetalles;

              const maxBase = Math.min(
                stockDisponibleParaEsteDetalle,
                pendienteBase - (tEntregadoDetalleActualBase - cant),
              );
              const maxLote = maxBase / (lote.contenido_por_presentacion || 1);

              return (
                <LoteRow
                  key={lote.id_lote}
                  lote={lote}
                  cant={cant}
                  idSolicitudDetalle={idSolicitudDetalle}
                  unidadMedidaBaseAbv={unidadMedidaBaseAbv}
                  maxBase={maxBase}
                  maxLote={maxLote}
                  stockAsignable={stockRestanteGlobal}
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
