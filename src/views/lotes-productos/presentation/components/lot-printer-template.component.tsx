import { TicketLote } from "../../../../presentation/utils/TicketLote";
import type { RES_Lote } from "../../service/lotes.responses";

interface LotPrinterTemplateProps {
  data: {
    lotes: RES_Lote[];
    almacenes: { id_almacen: number | string; nombre: string }[];
  };
}

/**
 * Componente que organiza uno o múltiples tickets de lote en una cuadrícula.
 * Maneja el layout y el espaciado para asegurar que la impresión use padding en los bordes.
 */
export const LotPrinterTemplate = ({ data }: LotPrinterTemplateProps) => {
  const { lotes, almacenes } = data;

  return (
    <div className="p-3 flex gap-3">
      {lotes.map((lote) => (
        <TicketLote
          key={lote.id_lote}
          data={{
            id: lote.id_lote,
            producto: lote.producto,
            lote: lote.correlativo,
            almacen:
              almacenes.find(
                (a) => String(a.id_almacen) === String(lote.id_almacen),
              )?.nombre || "Sin Almacén",
            descripcion: lote.descripcion,
            fecha_ingreso: lote.fecha_hora_ingreso,
          }}
        />
      ))}
    </div>
  );
};
