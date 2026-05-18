import { Table } from "@mantine/core";
import { ActivoRow } from "./activo-row";
import type { DetalleSolicitudExtendido } from "../../../../service/solicitudes-atencion.responses";
import type { RES_ActivoFijoDisponible } from "../../../../../../service/responses/activo-fijo";
import { JsonScanner } from "../../../../../../presentation/utils/json-scanner";
import { useJsonScanner } from "../../../../../../hooks/useJsonScanner";

interface ActivosTableProps {
  activosFijos: RES_ActivoFijoDisponible[];
  idDetalleSolicitud: number;
  pendienteBase: number;
  tEntregadoDetalleActualBase: number;
  entregaCantidadesActivos: Record<number, Record<number, number>>;
  detalle: DetalleSolicitudExtendido;
  handleCantActivoChange: (
    idDetalle: number,
    idActivo: number,
    cant: number,
  ) => void;
}

export const ActivosTable = ({
  activosFijos,
  idDetalleSolicitud,
  pendienteBase,
  tEntregadoDetalleActualBase,
  entregaCantidadesActivos,
  detalle,
  handleCantActivoChange,
}: ActivosTableProps) => {
  const { isFiltering, clearFilter, handleScanned, filterItems } =
    useJsonScanner();
  const activosVisibles = filterItems(activosFijos, "id_activo");

  return (
    <div className="overflow-hidden border border-zinc-800/60 rounded-2xl bg-zinc-950/30 shadow-inner">
      {/* Barra de escaneo QR */}
      <div className="flex justify-end px-4 py-2 border-b border-zinc-800/40 bg-zinc-900/30">
        <JsonScanner
          fields={["id"]}
          onScanned={handleScanned}
          isFiltering={isFiltering}
          onClearFilter={clearFilter}
          filteredCount={activosVisibles.length}
        />
      </div>

      <Table
        verticalSpacing="sm"
        horizontalSpacing="lg"
        className="border-collapse"
      >
        <thead className="bg-zinc-900/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800/60">
          <tr>
            <th className="py-4 text-center" style={{ width: "25%" }}>
              Activo Fijo
            </th>
            <th className="text-center" style={{ width: "20%" }}>
              Ubicación
            </th>
            <th className="text-center" style={{ width: "25%" }}>
              Control
            </th>
            <th className="pr-8 text-center" style={{ width: "30%" }}>
              Despachar
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {activosVisibles.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-10 text-center text-zinc-600 italic text-sm font-medium"
              >
                {isFiltering
                  ? "Ningún activo escaneado coincide con los disponibles."
                  : "No se encontraron activos fijos disponibles en este almacén."}
              </td>
            </tr>
          ) : (
            activosVisibles.map((activo) => {
              const cant =
                entregaCantidadesActivos[idDetalleSolicitud]?.[activo.id_activo] || 0;

              // Check if selected globally in any other detail
              const isSelectedElsewhere =
                Object.values(entregaCantidadesActivos).some(
                  (activosMap) => activosMap[activo.id_activo] > 0,
                ) && cant === 0;

              // Can only add if we haven't reached the pending limit
              const maxBase = Math.min(
                1,
                pendienteBase - (tEntregadoDetalleActualBase - cant),
              );

              return (
                <ActivoRow
                  key={activo.id_activo}
                  activo={activo}
                  idDetalleSolicitud={idDetalleSolicitud}
                  cant={cant}
                  maxBase={maxBase}
                  detalle={detalle}
                  isSelectedElsewhere={isSelectedElsewhere}
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
