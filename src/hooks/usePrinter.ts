import { useRef, useCallback } from "react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

export type PaperSize = "A4" | "A5" | "80mm" | "fit" | string;

export interface PrintConfig {
  documentTitle?: string;
  pageStyle?: string;
  size?: PaperSize;
  orientation?: "portrait" | "landscape";
  margin?: string;
  onAfterPrint?: () => void | Promise<void>;
  onBeforePrint?: () => void | Promise<void>;
}

/**
 * Hook utilitario para generar un PDF real y abrirlo en el visor nativo.
 * Ofrece total flexibilidad de tamaño (como dompdf) y soporta Tailwind/oklch.
 */
export const usePrinter = (
  config?: PrintConfig,
  externalRef?: React.RefObject<HTMLDivElement | null>,
) => {
  const localRef = useRef<HTMLDivElement>(null);
  const printRef = externalRef || localRef;

  /**
   * Genera un PDF Blob de alta fidelidad y lo abre en una nueva pestaña.
   */
  const openPDFBlobInNewTab = useCallback(async () => {
    if (!printRef.current) return;

    if (config?.onBeforePrint) await config.onBeforePrint();

    const element = printRef.current;
    
    try {
      // 1. Capturar el componente como imagen de alta resolución 
      // (html-to-image es inmune al error oklch porque usa SVG foreignObject)
      const dataUrl = await toPng(element, {
        pixelRatio: 3, // Calidad nítida para impresión
        backgroundColor: "transparent",
        cacheBust: true,
      });

      // 2. Medir dimensiones reales para el PDF
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => (img.onload = resolve));

      // Conversión de PX (browser) a MM (punto de impresión) - 96 DPI estándar
      const mmWidth = (img.width / 3 * 25.4) / 96;
      const mmHeight = (img.height / 3 * 25.4) / 96;

      // 3. Crear el documento PDF con tamaño exacto
      const pdf = new jsPDF({
        orientation: mmWidth > mmHeight ? "l" : "p",
        unit: "mm",
        format: [mmWidth, mmHeight],
        compress: true,
      });

      // 4. Inyectar la captura
      pdf.addImage(dataUrl, "PNG", 0, 0, mmWidth, mmHeight);

      // 5. Generar Blob y abrir en visor nativo
      const blob = pdf.output("blob");
      const blobURL = URL.createObjectURL(blob);
      
      // Abrir en visor nativo de forma directa
      window.open(blobURL, "_blank");

    } catch (error) {
      console.error("Error al generar el PDF nativo:", error);
      alert("Hubo un error al generar el PDF. Revisa la consola.");
    } finally {
      if (config?.onAfterPrint) await config.onAfterPrint();
    }
  }, [config, printRef]);

  return {
    printRef,
    print: openPDFBlobInNewTab,
  };
};
