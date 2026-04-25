import { Table, Text, Skeleton, Tooltip, ActionIcon } from "@mantine/core";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

import type {
  DTO_CotizacionRequest,
  DTO_ProductoComparativo,
  DTO_CotizacionDetalle,
} from "../../service/cotizaciones.requests";
import { CabeceraCotizacion } from "./cabecera-cotizacion";
import { CeldaDetalle } from "./celda-detalle";
import type { RES_Almacen } from "../../../../service/responses/almacen";

interface ComparativoTablaProps {
  productos: (
    | (DTO_ProductoComparativo & {
        nombre: string;
        codigo: string;
        id_unidad_medida_base: number;
        unidad_medida_base: string;
        unidad_medida_abreviatura: string;
      })
    | null
  )[];
  cotizaciones: DTO_CotizacionRequest[];
  unidadesMedida: { value: string; label: string; abreviatura: string }[];
  almacenes: RES_Almacen[];
  proveedores: { id_proveedor: number; razon_social: string }[];
  empresas: { id_empresa: number; razon_social: string }[];
  loadingProveedores?: boolean;
  onUpdateHeader: <K extends keyof DTO_CotizacionRequest>(
    index: number,
    field: K,
    value: DTO_CotizacionRequest[K],
  ) => void;
  onUpdateDetail: <K extends keyof DTO_CotizacionDetalle>(
    cotIndex: number,
    rowIndex: number,
    field: K,
    value: DTO_CotizacionDetalle[K],
  ) => void;
  onToggleNoCotiza: (cotIndex: number, rowIndex: number) => void;
  onRemoveCotizacion: (index: number) => void;
  onDuplicarFila?: (rowIndex: number) => void;
  onEliminarFila?: (rowIndex: number) => void;
}

export const ComparativoTabla = ({
  productos,
  cotizaciones,
  unidadesMedida,
  almacenes,
  proveedores,
  empresas,
  loadingProveedores,
  onUpdateHeader,
  onUpdateDetail,
  onToggleNoCotiza,
  onRemoveCotizacion,
  onDuplicarFila,
  onEliminarFila,
}: ComparativoTablaProps) => {
  const numCotizaciones = cotizaciones.length;
  const numSkeletons = Math.max(0, 4 - numCotizaciones);
  const totalCols = numCotizaciones + numSkeletons;
  const totalWidth = 120 + totalCols * 400;

  return (
    <div
      id="comparativo-container"
      className="h-full overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-xl custom-scrollbar relative"
    >
      <Table
        withColumnBorders
        withTableBorder={false}
        verticalSpacing="md"
        horizontalSpacing="md"
        layout="fixed"
        className="border-separate border-spacing-0"
        style={{
          width: totalWidth,
          minWidth: totalWidth,
          tableLayout: "fixed",
        }}
      >
        <Table.Thead className="z-50">
          <Table.Tr>
            {/* Esquina PRODUCTOS: Fija vertical y horizontalmente */}
            <Table.Th
              style={{ width: 120, minWidth: 120, verticalAlign: "middle" }}
              className="bg-zinc-900 border-b border-r border-zinc-800 sticky top-0 left-0 z-100 p-6 shadow-xl"
            >
              <Text
                size="xs"
                fw={800}
                className="text-white uppercase tracking-widest text-center"
              >
                Productos
              </Text>
            </Table.Th>

            {/* Renderizar Cotizaciones Reales */}
            {cotizaciones.map((cot, idx) => (
              <Table.Th
                key={`real-col-${idx}`}
                style={{
                  width: 400,
                  minWidth: 400,
                  maxWidth: 400,
                  verticalAlign: "top",
                }}
                className="bg-zinc-900 border-b border-zinc-800 p-0 sticky top-0 z-70"
              >
                <CabeceraCotizacion
                  cot={cot}
                  idx={idx}
                  proveedores={proveedores}
                  empresas={empresas}
                  loadingProveedores={loadingProveedores}
                  unidadesMedida={unidadesMedida}
                  onUpdateHeader={onUpdateHeader}
                  onRemoveCotizacion={onRemoveCotizacion}
                />
              </Table.Th>
            ))}

            {/* Renderizar Skeletons de relleno si hay menos de 3 */}
            {Array.from({ length: numSkeletons }).map((_, i) => (
              <Table.Th
                key={`sk-col-${numCotizaciones + i}`}
                style={{
                  width: 400,
                  minWidth: 400,
                  maxWidth: 400,
                  verticalAlign: "top",
                }}
                className="bg-zinc-900 border-b border-zinc-800 p-0 sticky top-0 z-70"
              >
                <CabeceraCotizacion
                  idx={numCotizaciones + i}
                  isSkeleton={true}
                  proveedores={proveedores}
                  empresas={empresas}
                  unidadesMedida={unidadesMedida}
                  onUpdateHeader={onUpdateHeader}
                  onRemoveCotizacion={onRemoveCotizacion}
                />
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {productos.length === 0 ? (
            // 1 Fila de Esqueleto si no hay productos
            <Table.Tr className="border-b border-zinc-900">
              <Table.Td
                style={{ width: 120, minWidth: 120 }}
                className="border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950/90 shadow-xl backdrop-blur-md p-4"
              >
                <div className="h-3 w-3/4 bg-zinc-800/50 rounded-full" />
              </Table.Td>

              {/* Celdas esqueleto si no hay productos */}
              {Array.from({ length: totalCols }).map((_, colIdx) => (
                <Table.Td
                  key={`sk-cell-empty-prod-${colIdx}`}
                  style={{ width: 400, minWidth: 400, maxWidth: 400 }}
                  className="p-4 align-top"
                >
                  <CeldaDetalle
                    cotIdx={colIdx}
                    unidadesMedida={unidadesMedida}
                    almacenes={almacenes}
                    onUpdateDetail={onUpdateDetail}
                    onToggleNoCotiza={onToggleNoCotiza}
                    isSkeleton={true}
                    rowIndex={0}
                  />
                </Table.Td>
              ))}
            </Table.Tr>
          ) : (
            productos.map((prod, pIdx) => (
              <Table.Tr
                key={`${prod?.id_producto}-${pIdx}`}
                className="border-b border-zinc-900 hover:bg-zinc-900/10 transition-colors"
              >
                {/* Columna fija del producto */}
                <Table.Td
                  style={{ width: 120, minWidth: 120 }}
                  className="border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950/90 shadow-xl backdrop-blur-md"
                >
                  {prod ? (
                    <div className="p-4 flex flex-col items-center justify-center gap-2">
                      <Text size="xs" fw={700} className="text-zinc-200 text-center">
                        {prod.nombre}
                      </Text>
                      <div className="flex gap-2">
                        {onDuplicarFila && (
                          <Tooltip label="Agregar otro destino" position="bottom">
                            <ActionIcon
                              variant="light"
                              color="cyan"
                              size="sm"
                              radius="xl"
                              onClick={() => onDuplicarFila(pIdx)}
                              className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {onEliminarFila && (
                          <Tooltip label="Eliminar fila" position="bottom">
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              radius="xl"
                              onClick={() => onEliminarFila(pIdx)}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-400"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4">
                      <Skeleton h={12} radius="md" />
                    </div>
                  )}
                </Table.Td>

                {/* Renderizar Celdas Reales */}
                {cotizaciones.map((cot, cotIdx) => {
                  const det = cot.detalles[pIdx];
                  if (!det || !prod)
                    return (
                      <Table.Td
                        key={`real-cell-${cotIdx}`}
                        style={{ width: 400, minWidth: 400, maxWidth: 400 }}
                        className="bg-zinc-900/20"
                      />
                    );

                  return (
                    <Table.Td
                      key={`real-cell-${cotIdx}`}
                      style={{ width: 400, minWidth: 400, maxWidth: 400 }}
                      className={`p-4 align-top relative transition-all duration-300 ${
                        det.no_cotiza ? "bg-zinc-950/30" : ""
                      }`}
                    >
                      <CeldaDetalle
                        det={det}
                        prod={prod}
                        cot={cot}
                        cotIdx={cotIdx}
                        unidadesMedida={unidadesMedida}
                        almacenes={almacenes}
                        onUpdateDetail={onUpdateDetail}
                        onToggleNoCotiza={onToggleNoCotiza}
                        rowIndex={pIdx}
                      />

                      {/* Overlay de 'No Cotiza' */}
                      {det.no_cotiza && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-6">
                          <div className="bg-red-500/10 border border-red-500/50 backdrop-blur-sm rounded-xl p-4 flex flex-col items-center gap-2 shadow-2xl">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-8 h-8 text-red-500 opacity-80"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                            <Text
                              size="xs"
                              fw={800}
                              className="text-red-500 uppercase tracking-tighter"
                            >
                              No participa
                            </Text>
                          </div>
                        </div>
                      )}
                    </Table.Td>
                  );
                })}

                {/* Renderizar Celdas Skeleton de relleno */}
                {Array.from({ length: numSkeletons }).map((_, i) => (
                  <Table.Td
                    key={`sk-cell-${numCotizaciones + i}`}
                    style={{ width: 400, minWidth: 400, maxWidth: 400 }}
                    className="p-4 align-top text-zinc-600/20"
                  >
                    <CeldaDetalle
                      cotIdx={numCotizaciones + i}
                      unidadesMedida={unidadesMedida}
                      almacenes={almacenes}
                      onUpdateDetail={onUpdateDetail}
                      onToggleNoCotiza={onToggleNoCotiza}
                      isSkeleton={true}
                      rowIndex={0}
                    />
                  </Table.Td>
                ))}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>

      {/* Estilos inline para la transición de hover en cabeceras */}
      <style>{`
        .group-header:hover .opacity-0 {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
