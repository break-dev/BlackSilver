import { Table, Text } from "@mantine/core";
import { useRef, useEffect } from "react";
import type {
  DTO_CotizacionRequest,
  DTO_ProductoComparativo,
  DTO_CotizacionDetalle,
} from "../../service/cotizaciones.requests";
import { CabeceraCotizacion } from "./cabecera-cotizacion";
import { CeldaDetalle } from "./celda-detalle";

interface ComparativoTablaProps {
  productos: (DTO_ProductoComparativo & {
    nombre: string;
    codigo: string;
    id_unidad_medida_base: number;
    unidad_medida_base: string;
    unidad_medida_abreviatura: string;
  })[];
  cotizaciones: DTO_CotizacionRequest[];
  unidadesMedida: { value: string; label: string; abreviatura: string }[];
  proveedores: { id_proveedor: number; razon_social: string }[];
  loadingProveedores?: boolean;
  onUpdateHeader: <K extends keyof DTO_CotizacionRequest>(
    index: number,
    field: K,
    value: DTO_CotizacionRequest[K],
  ) => void;
  onUpdateDetail: <K extends keyof DTO_CotizacionDetalle>(
    cotIndex: number,
    prodId: number,
    field: K,
    value: DTO_CotizacionDetalle[K],
  ) => void;
  onToggleNoCotiza: (cotIndex: number, prodId: number) => void;
  onRemoveCotizacion: (index: number) => void;
  isCollapsed?: boolean;
  onAutoCollapse?: (collapsed: boolean) => void;
}

export const ComparativoTabla = ({
  productos,
  cotizaciones,
  unidadesMedida,
  proveedores,
  loadingProveedores,
  onUpdateHeader,
  onUpdateDetail,
  onToggleNoCotiza,
  onRemoveCotizacion,
  isCollapsed = false,
  onAutoCollapse,
}: ComparativoTablaProps) => {
  // Referencia para guardar dónde estábamos cuando se expandió
  const scrollAlExpandir = useRef(0);

  useEffect(() => {
    if (!isCollapsed) {
      const container = document.getElementById("comparativo-container");
      if (container) scrollAlExpandir.current = container.scrollTop;
    }
  }, [isCollapsed]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;

    // Si estamos en vista detallada, solo colapsamos si el usuario se mueve
    // significativamente (>40px) desde donde lo abrió.
    if (!isCollapsed) {
      const desplazamiento = Math.abs(scrollTop - scrollAlExpandir.current);
      if (desplazamiento > 40) {
        onAutoCollapse?.(true);
      }
    }
  };

  return (
    <div
      id="comparativo-container"
      className="h-full overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950/50 shadow-xl custom-scrollbar relative"
      onScroll={handleScroll}
    >
      <Table
        withColumnBorders
        withTableBorder={false}
        verticalSpacing="md"
        horizontalSpacing="md"
        className="border-separate border-spacing-0 min-w-full"
      >
        <Table.Thead className="z-50">
          <Table.Tr>
            {/* Esquina PRODUCTOS: Fija vertical y horizontalmente */}
            <Table.Th
              style={{ width: 200, minWidth: 200, verticalAlign: "middle" }}
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

            {cotizaciones.map((cot, idx) => (
              <Table.Th
                key={idx}
                style={{ minWidth: 450, verticalAlign: "top" }}
                className="bg-zinc-900 border-b border-zinc-800 p-0 sticky top-0 z-40"
              >
                <CabeceraCotizacion
                  cot={cot}
                  idx={idx}
                  isCollapsed={isCollapsed}
                  proveedores={proveedores}
                  loadingProveedores={loadingProveedores}
                  unidadesMedida={unidadesMedida}
                  onUpdateHeader={onUpdateHeader}
                  onRemoveCotizacion={onRemoveCotizacion}
                />
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {productos.map((prod) => (
            <Table.Tr
              key={prod.id_producto}
              className="border-b border-zinc-900 hover:bg-zinc-900/10 transition-colors"
            >
              {/* Columna fija del producto */}
              <Table.Td
                style={{ width: 200, minWidth: 200 }}
                className="border-r border-zinc-800 sticky left-0 z-20 bg-zinc-950/90 shadow-xl backdrop-blur-md"
              >
                <Text size="xs" fw={700} className="text-zinc-200">
                  {prod.nombre}
                </Text>
              </Table.Td>

              {cotizaciones.map((cot, cotIdx) => {
                const det = cot.detalles.find(
                  (d) => d.id_producto === prod.id_producto,
                );
                if (!det)
                  return <Table.Td key={cotIdx} className="bg-zinc-900/20" />;

                return (
                  <Table.Td
                    key={cotIdx}
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
                      onUpdateDetail={onUpdateDetail}
                      onToggleNoCotiza={onToggleNoCotiza}
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
            </Table.Tr>
          ))}
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
