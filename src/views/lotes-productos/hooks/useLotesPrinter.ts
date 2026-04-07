import { useCallback } from "react";
import { usePrinter } from "../../../hooks/usePrinter";
import type { RES_Lote } from "../service/lotes.responses";
import { LotPrinterTemplate } from "../presentation/components/lot-printer-template.component";

export const useLotesPrinter = (almacenes: { id_almacen: number | string; nombre: string }[]) => {
  const { print } = usePrinter();

  const printLotes = useCallback(
    (lotes: RES_Lote | RES_Lote[]) => {
      const lotesArray = Array.isArray(lotes) ? lotes : [lotes];
      
      if (lotesArray.length === 0) return;

      print(
        { lotes: lotesArray, almacenes },
        LotPrinterTemplate
      );
    },
    [print, almacenes],
  );

  return { printLotes };
};
