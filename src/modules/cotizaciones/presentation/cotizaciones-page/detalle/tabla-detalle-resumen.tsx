import { useMemo } from "react";
import { Table, Text } from "@mantine/core";
import { CabeceraDetalleCotizacion } from "./cabecera-detalle-cotizacion";
import { CeldaDetalleItem } from "./celda-detalle-item";
import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../../../../../service/responses/cotizaciones/cotizacion";

interface TablaDetalleResumenProps {
  cotizaciones: RES_Cotizacion[];
  empresas: {
    id_cotizacion: number;
    id_empresa: number;
    razon_social: string;
  }[];
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
      if (
        !map.has(d.id_comparativo_detalle) ||
        !map.get(d.id_comparativo_detalle).unidadBase
      ) {
        map.set(d.id_comparativo_detalle, {
          id: d.id_comparativo_detalle,
          nombre: d.producto,
          unidadBase: d.unidad_medida_base_abv,
        });
      }
    });
    return Array.from(map.values());
  }, [detalles]);

  const cheapestPrices = useMemo(() => {
    const pricesMap = new Map<number, number>();
    productosUnicos.forEach((prod) => {
      // Filtrar detalles para este producto y que tengan precio
      const relatedDetalles = detalles.filter(
        (d) => d.id_comparativo_detalle === prod.id && Number(d.precio_unitario_base) > 0
      );

      if (relatedDetalles.length > 0) {
        // Normalizar todos los precios a Soles (Base Price * TC)
        const normalizedPrices = relatedDetalles.map((d) => {
          const parentCot = cotizaciones.find((c) => c.id_cotizacion === d.id_cotizacion);
          const tc = parentCot?.tipo_cambio_venta_referencial || 1;
          const moneda = parentCot?.moneda || "Soles";
          // Si es Soles, TC es 1. Si es otra, multiplicamos por su TC.
          const basePrice = Number(d.precio_unitario_base);
          return moneda === "Soles" ? basePrice : basePrice * tc;
        });

        const minNormalized = Math.min(...normalizedPrices);
        // Guardamos el precio normalizado mínimo para este producto
        pricesMap.set(prod.id, minNormalized);
      }
    });
    return pricesMap;
  }, [productosUnicos, detalles, cotizaciones]);

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
                className="bg-zinc-900 border-b-2 border-r border-zinc-800 p-4 text-center sticky top-0 left-0 z-110 shadow-xl"
                style={{
                  width: 100,
                  minWidth: 100,
                  maxWidth: 100,
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
                  key={cot.id_cotizacion}
                  className="p-0 border-b-2 border-r border-zinc-800 align-top sticky top-0 z-40 bg-zinc-900"
                  style={{ width: 450, minWidth: 450, maxWidth: 450 }}
                >
                  <CabeceraDetalleCotizacion
                    proveedor={cot.proveedor}
                    idCotizacion={cot.id_cotizacion}
                    nroCotizacion={cot.correlativo}
                    moneda={cot.moneda}
                    metodoPago={cot.metodo_pago}
                    empresas={empresas.filter(
                      (e) => e.id_cotizacion === cot.id_cotizacion,
                    )}
                    vencimiento={cot.fecha_vencimiento_pago}
                    incluyeIgv={Number(cot.incluye_igv) === 1}
                    porcentajeIgv={Number(cot.porcentaje_igv)}
                    montoIgv={Number(cot.monto_igv)}
                    totalAntesIgv={Number(cot.total_antes_igv)}
                    totalDespuesIgv={Number(cot.total_despues_igv)}
                    observacion={cot.observacion}
                    estado={cot.estado}
                    onApprove={onApprove}
                    loading={loadingApprove === cot.id_cotizacion}
                    isCollapsed={isCollapsed}
                    tipoCambio={cot.tipo_cambio_venta_referencial}
                  />
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {productosUnicos.map((prod) => (
              <Table.Tr
                key={prod.id}
                className="group-tr hover:bg-zinc-900/40 transition-colors"
              >
                <Table.Td
                  className="p-4 border-r border-b border-zinc-800 align-middle bg-zinc-900/40 sticky left-0 z-20 shadow-xl text-center"
                  style={{
                    width: 100,
                    minWidth: 100,
                    maxWidth: 100,
                    verticalAlign: "middle",
                  }}
                >
                  <Text
                    size="xs"
                    fw={900}
                    className="text-zinc-100 leading-tight text-center"
                  >
                    {prod.nombre}
                  </Text>
                </Table.Td>

                {cotizaciones.map((cot) => {
                  const det = detalles.find(
                    (d) =>
                      d.id_cotizacion === cot.id_cotizacion &&
                      d.id_comparativo_detalle === prod.id,
                  );
                  const normalizedPrice = det ? (() => {
                    const tc = cot.tipo_cambio_venta_referencial || 1;
                    const basePrice = Number(det.precio_unitario_base);
                    return cot.moneda === "Soles" ? basePrice : basePrice * tc;
                  })() : null;

                  const isCheapest =
                    det &&
                    normalizedPrice !== null &&
                    Math.abs(normalizedPrice - (cheapestPrices.get(prod.id) || 0)) < 0.0001;

                  return (
                    <Table.Td
                      key={cot.id_cotizacion}
                      className="p-4 border-r border-b border-zinc-800 align-top"
                      style={{ width: 450, minWidth: 450, maxWidth: 450 }}
                    >
                      {det ? (
                        <CeldaDetalleItem
                          cantidad={Number(det.cantidad)}
                          precioUnitario={Number(det.precio_unitario)}
                          moneda={cot.moneda}
                          unidadMedida={det.unidad_medida_ctz_abv}
                          contenidoPorPresentacion={Number(
                            det.contenido_por_presentacion,
                          )}
                          unidadMedidaBase={prod.unidadBase}
                          comentario={det.comentario}
                          noCotiza={false}
                          estado={det.estado}
                          almacenRecepcionista={det.almacen_recepcionista}
                          esAlmacenPrincipal={Boolean(
                            det.para_un_almacen_principal,
                          )}
                          tipoDespacho={det.tipo_despacho}
                          lugarRecojo={det.lugar_recojo}
                          tiempoEntrega={det.tiempo_entrega}
                          tiempoEntregaPeriodo={det.tiempo_entrega_periodo}
                          tiempoEntregaDias={det.tiempo_entrega_dias}
                          esAuditable={Boolean(det.es_auditable)}
                          esPerecible={Boolean(det.es_perecible)}
                          isCheapest={isCheapest}
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
