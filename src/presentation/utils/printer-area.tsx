import { useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { usePrinterStore } from "../../stores/printer.store";

/**
 * Componente global que gestiona el motor de impresión silenciosa.
 * Utiliza react-to-print para renderizado aislado respetando Tailwind,
 * sin afectar el DOM principal.
 */
export const PrinterArea = () => {
  const { items, Template, reset, isReady, setReady, config } =
    usePrinterStore();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: config?.documentTitle || "Documento BlackSilver",
    pageStyle:
      config?.pageStyle ||
      `
      @page { size: auto; margin: 0; }
      @media print { body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; } }
    `,
    onAfterPrint: () => reset(),
  });

  // Cuando detectamos items preparamos la impresión
  useEffect(() => {
    if (items.length > 0 && Template) {
      const timer = setTimeout(() => {
        setReady(true);
      }, 400); // delay suficiente para cargar imágenes, etc.
      return () => clearTimeout(timer);
    }
  }, [items, Template, setReady]);

  // Si está listo, disparamos
  useEffect(() => {
    if (isReady && handlePrint) {
      handlePrint();
    }
  }, [isReady, handlePrint]);

  if (items.length === 0 || !Template) return null;

  const PageTemplate = Template;

  return (
    <div style={{ display: "none" }}>
      <div
        ref={printRef}
        className="text-black bg-white w-full mx-auto flex flex-col items-center"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="w-[60mm] print:w-full relative page-break-after-always"
          >
            <PageTemplate data={item} />
          </div>
        ))}
      </div>
    </div>
  );
};
