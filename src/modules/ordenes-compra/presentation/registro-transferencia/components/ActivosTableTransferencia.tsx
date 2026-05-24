import { Table } from "@mantine/core";
import { ActivoRowTransferencia } from "./ActivoRowTransferencia";
import type { RES_ActivoFijoDisponible } from "../../../../../service/responses/activo-fijo";
import { JsonScanner } from "../../../../../presentation/utils/json-scanner";
import { useJsonScanner } from "../../../../../hooks/useJsonScanner";

interface ActivosTableProps {
  activosFijos: RES_ActivoFijoDisponible[];
  idDetalle: number;
  transferenciaCantidadesActivos: Record<number, Record<number, number>>;
  handleCantActivoChange: (
    idDetalle: number,
    idActivo: number,
    cant: number,
  ) => void;
}

export const ActivosTableTransferencia = ({
  activosFijos,
  idDetalle,
  transferenciaCantidadesActivos,
  handleCantActivoChange,
}: ActivosTableProps) => {
  const { isFiltering, clearFilter, handleScanned, filterItems } =
    useJsonScanner();
  const activosVisibles = filterItems(activosFijos, "id_activo");

  return (
    <div className="overflow-hidden border border-zinc-800/60 rounded-3xl bg-zinc-950/60 shadow-2xl">
      {/* Barra de escaneo QR */}
      <div className="flex justify-end px-4 py-2 border-b border-zinc-800/30 bg-zinc-900/30">
        <JsonScanner
          fields={["id"]}
          onScanned={handleScanned}
          isFiltering={isFiltering}
          onClearFilter={clearFilter}
          filteredCount={activosVisibles.length}
        />
      </div>

      <Table
        verticalSpacing="md"
        horizontalSpacing="xl"
        className="border-collapse"
      >
        <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800/60">
          <tr>
            <th className="py-4 text-center" style={{ width: "25%" }}>
              Activo Fijo
            </th>
            <th className="text-center" style={{ width: "25%" }}>
              Ubicación
            </th>
            <th className="text-center" style={{ width: "25%" }}>
              Control
            </th>
            <th className="pr-8 text-center" style={{ width: "25%" }}>
              Transferir
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/10">
          {activosVisibles.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-10 text-center text-zinc-600 italic text-xs font-medium"
              >
                {isFiltering
                  ? "Ningún activo escaneado coincide con los disponibles."
                  : "No se encontraron activos fijos disponibles para esta recepción."}
              </td>
            </tr>
          ) : (
            activosVisibles.map((activo: RES_ActivoFijoDisponible) => {
              const cant =
                transferenciaCantidadesActivos[idDetalle]?.[activo.id_activo] || 0;

              return (
                <ActivoRowTransferencia
                  key={activo.id_activo}
                  activo={activo}
                  idDetalle={idDetalle}
                  cant={cant}
                  handleCantActivoChange={handleCantActivoChange}
                />
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};
