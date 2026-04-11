import type { ReactElement } from "react";
import { usePrinterStore, type PrintConfig } from "../stores/printer.store";

/**
 * Encola un <Document> de @react-pdf/renderer para generar
 * un PDF vectorial y abrirlo en nueva pestaña sin diálogo.
 *
 * @example
 * const { print } = usePrint();
 * print(<MiDocumentoPDF data={data} />, { documentTitle: "Mi Doc" });
 */
export const usePrint = () => {
  const enqueuePrint = usePrinterStore((s) => s.enqueuePrint);

  return {
    print: (document: ReactElement, config?: PrintConfig) => {
      enqueuePrint(document, config);
    },
  };
};
