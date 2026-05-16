import { useMemo } from "react";
import { Table, Text } from "@mantine/core";
import type {
  DTO_CotizacionRequest,
  DTO_ProductoComparativo,
  DTO_CotizacionDetalle,
} from "../../../service/cotizaciones.requests";
import { EdicionCabeceraCotizacion } from "./edicion-cabecera-cotizacion";
import { CeldaDetalle } from "../../registro-cotizacion/components/celda-detalle";
import type { RES_Almacen } from "../../../../../service/responses/almacen";
import type { RES_Mina } from "../../../../../service/responses/mina";
import { TipoDespachoCompra } from "../../../../../shared/enums/_generic/tipo-despacho-compra";
import { Periodo } from "../../../../../shared/enums/_generic/periodo";
import { TipoBien } from "../../../../../shared/enums/_generic/tipo-bien";
import type { RES_Proveedor } from "../../../../../service/responses/proveedor";
import type { RES_Empresa } from "../../../../../service/responses/empresa";

interface EdicionCotizacionTablaProps {
  productos: (
    | (DTO_ProductoComparativo & {
        nombre: string;
        codigo: string;
        id_unidad_medida_base: number;
        unidad_medida_base: string;
        unidad_medida_abreviatura: string;
        tipo_bien?: TipoBien;
      })
    | null
  )[];
  cotizacion: DTO_CotizacionRequest; // Solo una cotización en edición
  correlativo?: string;
  unidadesMedida: { value: string; label: string; abreviatura: string }[];
  almacenes: RES_Almacen[];
  minas: RES_Mina[];
  proveedores: RES_Proveedor[];
  empresas: RES_Empresa[];
  loadingProveedores?: boolean;
  loadingMaestros?: boolean;
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
  onUpdateGlobalLogistica?: (
    cotIndex: number,
    data: {
      id_almacen_recepcionista: number | null;
      id_mina_destino?: number | null;
      tipo_despacho: TipoDespachoCompra;
      lugar_recojo?: string;
      tiempo_entrega: number;
      tiempo_entrega_periodo: Periodo;
    },
  ) => void;
}

export const EdicionCotizacionTabla = ({
  productos,
  cotizacion,
  correlativo,
  unidadesMedida,
  almacenes,
  minas,
  proveedores,
  empresas,
  loadingProveedores,
  loadingMaestros,
  onUpdateHeader,
  onUpdateDetail,
  onToggleNoCotiza,
  onUpdateGlobalLogistica,
}: EdicionCotizacionTablaProps) => {
  
  // En edición el ancho es fijo para una sola columna + la columna de productos
  const totalWidth = 120 + 400;

  const hasActivosFijos = useMemo(
    () => productos.some((p) => p?.tipo_bien === TipoBien.ActivoFijo),
    [productos],
  );

  return (
    <div
      id="edicion-cotizacion-container"
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

            {/* Cabecera Única de Cotización */}
            <Table.Th
              style={{
                width: 400,
                minWidth: 400,
                maxWidth: 400,
                verticalAlign: "top",
              }}
              className="bg-zinc-900 border-b border-zinc-800 p-0 sticky top-0 z-70"
            >
                <EdicionCabeceraCotizacion
                cot={cotizacion}
                idx={0}
                correlativo={correlativo}
                proveedores={proveedores}
                empresas={empresas}
                loadingProveedores={loadingProveedores}
                loadingMaestros={loadingMaestros}
                onUpdateHeader={onUpdateHeader}
                almacenes={almacenes}
                minas={minas}
                hasActivosFijos={hasActivosFijos}
                onUpdateGlobalLogistica={onUpdateGlobalLogistica}
              />
            </Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {productos.map((prod, pIdx) => (
            <Table.Tr
              key={`${prod?.id_producto}-${pIdx}`}
              className="border-b border-zinc-900 hover:bg-zinc-900/10 transition-colors"
            >
              {/* Columna fija del producto */}
              <Table.Td
                style={{ width: 120, minWidth: 120 }}
                className="border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950/90 shadow-xl backdrop-blur-md"
              >
                {prod && (
                  <div className="p-4 flex flex-col items-center justify-center gap-2">
                    <Text
                      size="xs"
                      fw={700}
                      className="text-zinc-200 text-center"
                    >
                      {prod.nombre}
                    </Text>
                  </div>
                )}
              </Table.Td>

              {/* Celda de Edición Única */}
              <Table.Td
                style={{ width: 400, minWidth: 400, maxWidth: 400 }}
                className={`p-4 align-top relative transition-all duration-300 ${
                  cotizacion.detalles[pIdx]?.no_cotiza ? "bg-zinc-950/30" : ""
                }`}
              >
                {prod && cotizacion.detalles[pIdx] && (
                  <CeldaDetalle
                    det={cotizacion.detalles[pIdx]}
                    prod={prod}
                    cot={cotizacion}
                    cotIdx={0}
                    unidadesMedida={unidadesMedida}
                    almacenes={almacenes}
                    minas={minas}
                    onUpdateDetail={onUpdateDetail}
                    onToggleNoCotiza={onToggleNoCotiza}
                    rowIndex={pIdx}
                    isReadOnlyNoCotiza={true} // Bloqueado en edición individual
                  />
                )}

                {/* Overlay de 'No Cotiza' */}
                {cotizacion.detalles[pIdx]?.no_cotiza && (
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
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
};
