import { usePrinterStore, type PrintConfig } from "../stores/printer.store";
import React from "react";

/**
 * Hook global para interactuar con el sistema de impresión centralizado react-to-print.
 */
export const usePrinter = () => {
  const printAction = usePrinterStore((state) => state.print);
  const resetAction = usePrinterStore((state) => state.reset);

  /**
   * Dispara un proceso de impresión limpio montando el componente detrás de escena en un IFrame aislándolo.
   * @param data Lista de items o item único a imprimir.
   * @param Template Componente visual que servirá como diseño aislado.
   * @param config Opciones específicas del documento para react-to-print. (como título, orientacion, paper-size)
   */
  const print = <T>(
    data: T | T[],
    Template: React.ComponentType<{ data: T }>,
    config?: PrintConfig,
  ) => {
    printAction(data, Template, config);
  };

  return {
    print,
    reset: resetAction,
  };
};
