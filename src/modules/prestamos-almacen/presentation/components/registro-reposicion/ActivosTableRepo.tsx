import { Table, Text } from "@mantine/core";
import { ActivoRowRepo } from "./ActivoRowRepo";
import type { RES_ActivoFijoDisponible } from "../../../../../service/responses/activo-fijo";
import { JsonScanner } from "../../../../../presentation/utils/json-scanner";
import { useJsonScanner } from "../../../../../hooks/useJsonScanner";

interface ActivosTableRepoProps {
  activosFijos: RES_ActivoFijoDisponible[];
  idDetalle: number;
  pendienteBase: number;
  tRepuestoDetalleActualBase: number;
  reposicionCantidadesActivos: Record<number, Record<number, number>>;
  loadingActivos: boolean;
  handleCantActivoChange: (
    idDetalle: number,
    idActivo: number,
    cant: number,
  ) => void;
}

export const ActivosTableRepo = ({
  activosFijos,
  idDetalle,
  pendienteBase,
  tRepuestoDetalleActualBase,
  reposicionCantidadesActivos,
  loadingActivos,
  handleCantActivoChange,
}: ActivosTableRepoProps) => {
  const { isFiltering, clearFilter, handleScanned, filterItems } =
    useJsonScanner();
  const activosVisibles = filterItems(activosFijos, "id_activo");

  return (
    <div className="overflow-hidden border border-zinc-800/60 rounded-xl bg-zinc-950/30 shadow-inner">
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
          {loadingActivos ? (
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
                    Buscando Activos...
                  </Text>
                </div>
              </td>
            </tr>
          ) : activosVisibles.length === 0 ? (
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
            activosVisibles.map((activo: RES_ActivoFijoDisponible) => {
              const cant =
                reposicionCantidadesActivos[idDetalle]?.[activo.id_activo] || 0;

              // Check if selected globally in any other detail
              const isSelectedElsewhere =
                Object.values(reposicionCantidadesActivos).some(
                  (activosMap) => activosMap[activo.id_activo] > 0,
                ) && cant === 0;

              // Can only add if we haven't reached the pending limit
              const maxBase = Math.min(
                1,
                pendienteBase - (tRepuestoDetalleActualBase - cant),
              );

              return (
                <ActivoRowRepo
                  key={activo.id_activo}
                  activo={activo}
                  idDetalle={idDetalle}
                  cant={cant}
                  maxBase={maxBase}
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
