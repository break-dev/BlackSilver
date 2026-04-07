import { useMemo } from "react";
import type { RES_Lote } from "../service/lotes.responses";
import type { GroupedProduct } from "../presentation/lotes-page/types";
import { EstadoVencimiento } from "../../../shared/enums/estados";

export const useGroupedProducts = (records: RES_Lote[]) => {
  return useMemo(() => {
    const groups: Record<number, GroupedProduct> = {};

    records.forEach((lote) => {
      if (!groups[lote.id_producto]) {
        groups[lote.id_producto] = {
          id_producto: lote.id_producto,
          producto: lote.producto,
          categoria: lote.categoria,
          unidad_medida_base: lote.unidad_medida_base,
          stock_minimo: lote.stock_minimo,
          lotes: [],
          total_stock_base: 0,
          vigentes: 0,
          por_vencer: 0,
          vencidos: 0,
          es_perecible: lote.es_perecible,
          es_fiscalizado: lote.es_fiscalizado,
        };
      }
      const group = groups[lote.id_producto];
      group.lotes.push(lote);
      group.total_stock_base += Number(lote.stock_actual_base || 0);

      // Solo contabilizamos si el lote tiene stock positivo
      if (Number(lote.stock_actual_base) > 0) {
        if (lote.estado_vencimiento === EstadoVencimiento.Vencido) {
          group.vencidos++;
        } else if (lote.estado_vencimiento === EstadoVencimiento.PorVencer) {
          group.por_vencer++;
        } else if (
          lote.estado_vencimiento === EstadoVencimiento.Vigente ||
          lote.estado_vencimiento === EstadoVencimiento.NA ||
          lote.estado_vencimiento === EstadoVencimiento.SinFecha
        ) {
          group.vigentes++;
        }
      }
    });

    return Object.values(groups).sort((a, b) =>
      a.producto.localeCompare(b.producto),
    );
  }, [records]);
};
