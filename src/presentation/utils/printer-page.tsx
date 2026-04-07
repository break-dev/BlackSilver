/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "../functions/cn";
import { usePrinter, type PaperSize } from "../../hooks/usePrinter";

interface PrinterModalProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  opened: boolean | number; // Soporta booleano o pulso (contador)
  onAfterPrint?: () => void;
  children: React.ReactNode | ((data: any) => React.ReactNode);
  triggerData?: any; // Datos opcionales para el render prop
  //
  size?: PaperSize;
  orientation?: "portrait" | "landscape";
  documentTitle?: string;
}

export const PrinterPage = forwardRef<HTMLDivElement, PrinterModalProps>(
  (
    {
      opened,
      onAfterPrint,
      children,
      triggerData,
      className,
      size = "A4",
      orientation = "portrait",
      documentTitle = "Documento BlackSilver",
      ...props
    },
    externalRef,
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);

    // Hook local para manejar la lógica de generación de PDF
    const { print } = usePrinter(
      {
        size,
        orientation,
        documentTitle,
        onAfterPrint: onAfterPrint, // Si existe, se llama al terminar
      },
      internalRef,
    );

    // CONTROL: Escuchar el estado 'opened' (booleano o número que cambia)
    useEffect(() => {
      if (opened) {
        // Delay para asegurar renderizado y dom-to-image
        const timer = setTimeout(() => {
          print();
        }, 300);
        return () => clearTimeout(timer);
      }
    }, [opened, print]);

    // Combinar refs de forma segura
    const setRefs = (node: HTMLDivElement | null) => {
      if (internalRef) (internalRef as any).current = node;

      if (typeof externalRef === "function") {
        externalRef(node);
      } else if (externalRef) {
        (externalRef as any).current = node;
      }
    };

    return (
      <div
        className={cn(
          "opacity-0 fixed top-0 left-0 -z-50 pointer-events-none",
          !opened && "hidden",
        )}
      >
        <div
          ref={setRefs}
          className={cn(
            "text-black bg-white flex flex-col items-center p-3",
            className,
          )}
          style={{
            ...props.style,
          }}
          {...props}
        >
          {typeof children === "function" ? children(triggerData) : children}
        </div>
      </div>
    );
  },
);
