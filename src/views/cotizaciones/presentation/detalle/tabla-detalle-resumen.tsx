import { useMemo } from "react";
import { Table, Stack, Text, Badge } from "@mantine/core";
import { CabeceraDetalleCotizacion } from "./cabecera-detalle-cotizacion";
import { CeldaDetalleItem } from "./celda-detalle-item";
import type {
  RES_Cotizacion,
  RES_CotizacionDetalle,
} from "../../service/cotizaciones.responses";

interface TablaDetalleResumenProps {
  cotizaciones: RES_Cotizacion[];
  detalles: RES_CotizacionDetalle[];
  isCollapsed: boolean;
}

export const TablaDetalleResumen = ({
  cotizaciones,
  detalles,
  isCollapsed,
}: TablaDetalleResumenProps) => {
  const productosUnicos = useMemo(() => {
    const map = new Map();
    detalles.forEach((d) => {
      if (!map.has(d.id_comparativo_detalle)) {
        map.set(d.id_comparativo_detalle, {
          id: d.id_comparativo_detalle,
          nombre: d.producto_nombre,
          unidadBase: d.unidad_medida_abv,
        });
      }
    });
    return Array.from(map.values());
  }, [detalles]);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-3xl border border-zinc-800/80 shadow-2xl overflow-hidden backdrop-blur-md">
      <div className="flex-1 overflow-auto custom-scrollbar">
        <Table
          withColumnBorders
          withTableBorder={false}
          className="border-collapse table-fixed min-w-[900px]"
        >
          <Table.Thead className="sticky top-0 z-20 shadow-xl shadow-black/20">
            <Table.Tr>
              <Table.Th
                className="bg-zinc-950 border-r border-zinc-800 p-4 text-center"
                style={{ width: "250px" }}
              >
                <Text
                  size="xs"
                  fw={800}
                  className="text-white uppercase tracking-widest"
                >
                  Productos
                </Text>
              </Table.Th>
              {cotizaciones.map((cot) => (
                <Table.Th
                  key={cot.id}
                  className="p-0 border-r border-zinc-800 align-top"
                  style={{ width: isCollapsed ? "180px" : "320px" }}
                >
                  <CabeceraDetalleCotizacion
                    proveedor={cot.proveedor_nombre}
                    nroCotizacion={cot.correlativo}
                    moneda={cot.moneda}
                    metodoPago={cot.metodo_pago}
                    vencimiento={cot.fecha_vencimiento_pago}
                    incluyeIgv={Number(cot.incluye_igv) === 1}
                    montoIgv={Number(cot.monto_igv)}
                    totalAntesIgv={Number(cot.total_antes_igv)}
                    totalDespuesIgv={Number(cot.total_despues_igv)}
                    observacion={cot.observacion}
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
                <Table.Td className="p-4 border-r border-b border-zinc-800 align-top bg-zinc-950/20 backdrop-blur-sm sticky left-0 z-10">
                  <Stack gap={4}>
                    <Text
                      size="xs"
                      fw={900}
                      className="text-zinc-100 leading-tight"
                    >
                      {prod.nombre}
                    </Text>
                    <Badge
                      variant="outline"
                      color="zinc"
                      size="9px"
                      className="font-bold opacity-60"
                    >
                      UND: {prod.unidadBase}
                    </Badge>
                  </Stack>
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
                            Sin Oferta
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
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #09090b; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }`}</style>
    </div>
  );
};
