import { useMemo } from "react";
import { Table, Text } from "@mantine/core";
import { CabeceraDetalleCotizacion } from "./cabecera-detalle-cotizacion";
import { CeldaDetalleItem } from "./celda-detalle-item";
import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../../service/cotizaciones.responses";

interface TablaDetalleResumenProps {
  cotizaciones: RES_Cotizacion[];
  empresas: { id_cotizacion: number; id_empresa: number; razon_social: string }[];
  detalles: RES_CotizacionDetalle[];
  isCollapsed: boolean;
  onApprove?: (id: number) => void;
  loadingApprove?: number | null;
}

export const TablaDetalleResumen = ({
  cotizaciones,
  empresas,
  detalles,
  isCollapsed,
  onApprove,
  loadingApprove,
}: TablaDetalleResumenProps) => {
  const productosUnicos = useMemo(() => {
    const map = new Map();
    detalles.forEach((d) => {
        if (!map.has(d.id_comparativo_detalle) || !map.get(d.id_comparativo_detalle).unidadBase) {
          map.set(d.id_comparativo_detalle, {
            id: d.id_comparativo_detalle,
            nombre: d.producto_nombre,
            unidadBase: d.unidad_medida_base_abv,
          });
        }
    });
    return Array.from(map.values());
  }, [detalles]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 rounded-3xl border border-zinc-800/80 shadow-2xl overflow-hidden relative">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Table
          withColumnBorders
          withTableBorder={false}
          className="border-separate border-spacing-0"
          style={{ width: "max-content", minWidth: "100%" }}
        >
          <Table.Thead className="z-50">
            <Table.Tr>
              {/* Esquina PRODUCTOS: Fija without forced height */}
              <Table.Th
                className="bg-zinc-950 border-b border-r border-zinc-800 p-4 text-center sticky top-0 left-0 z-110 shadow-xl"
                style={{
                  width: 200,
                  minWidth: 200,
                  maxWidth: 200,
                  verticalAlign: "middle",
                }}
              >
                <Text
                  size="xs"
                  fw={800}
                  className="text-white uppercase tracking-widest text-center"
                >
                  Productos
                </Text>
              </Table.Th>

              {/* Columnas de Cotización: Sólidas y pegadas arriba */}
              {cotizaciones.map((cot) => (
                <Table.Th
                  key={cot.id}
                  className="p-0 border-b border-r border-zinc-800 align-top sticky top-0 z-40 bg-zinc-950"
                  style={{ width: 450, minWidth: 450, maxWidth: 450 }}
                >
                  <CabeceraDetalleCotizacion
                    proveedor={cot.proveedor_nombre}
                    idCotizacion={cot.id}
                    nroCotizacion={cot.correlativo}
                    moneda={cot.moneda}
                    metodoPago={cot.metodo_pago}
                    empresas={empresas.filter((e) => e.id_cotizacion === cot.id)}
                    vencimiento={cot.fecha_vencimiento_pago}
                    incluyeIgv={Number(cot.incluye_igv) === 1}
                    porcentajeIgv={Number(cot.porcentaje_igv)}
                    montoIgv={Number(cot.monto_igv)}
                    totalAntesIgv={Number(cot.total_antes_igv)}
                    totalDespuesIgv={Number(cot.total_despues_igv)}
                    observacion={cot.observacion}
                    estado={cot.estado}
                    onApprove={onApprove}
                    loading={loadingApprove === cot.id}
                    isCollapsed={isCollapsed}
                  />
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {productosUnicos.map((prod) => (
              <Table.Tr
                key={prod.id}
                className="group-tr hover:bg-white/1 transition-colors"
              >
                <Table.Td
                  className="p-4 border-r border-b border-zinc-800 align-middle bg-zinc-950 sticky left-0 z-20 shadow-xl text-left"
                  style={{
                    width: 200,
                    minWidth: 200,
                    maxWidth: 200,
                    verticalAlign: "middle",
                  }}
                >
                  <Text
                    size="xs"
                    fw={900}
                    className="text-zinc-100 leading-tight"
                  >
                    {prod.nombre}
                  </Text>
                </Table.Td>

                {cotizaciones.map((cot) => {
                  const det = detalles.find(
                    (d) =>
                      d.id_cotizacion === cot.id &&
                      d.id_comparativo_detalle === prod.id,
                  );
                  return (
                    <Table.Td
                      key={cot.id}
                      className="p-4 border-r border-b border-zinc-800 align-top"
                      style={{ width: 450, minWidth: 450, maxWidth: 450 }}
                    >
                      {det ? (
                        <CeldaDetalleItem
                          cantidad={Number(det.cantidad)}
                          precioUnitario={Number(det.precio_unitario)}
                          moneda={cot.moneda}
                          unidadMedida={det.unidad_medida_abv}
                          contenidoPorPresentacion={Number(
                            det.contenido_por_presentacion,
                          )}
                          unidadMedidaBase={prod.unidadBase}
                          comentario={det.comentario}
                          noCotiza={Number(det.no_cotiza) === 1}
                        />
                      ) : (
                        <div className="h-full min-h-[80px] flex items-center justify-center bg-zinc-950/10 rounded-2xl border border-dashed border-zinc-800/40 opacity-30 italic">
                          <Text size="xs" c="dimmed" fw={700}>
                            No cotizado
                          </Text>
                        </div>
                      )}
                    </Table.Td>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #09090b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
};
