/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import React from "react";

export interface PrintConfig {
  documentTitle?: string;
  pageStyle?: string;
}

interface PrinterState {
  items: unknown[];
  Template: React.ComponentType<{ data: any }> | null;
  config: PrintConfig | null;
  isReady: boolean;

  /**
   * Dispara el proceso de impresión global.
   * @param data Lista de items o item único a imprimir.
   * @param Template Componente de React que servirá como plantilla de diseño.
   * @param config Configuraciones avanzadas para react-to-print.
   */
  print: <T>(
    data: T | T[],
    Template: React.ComponentType<{ data: T }>,
    config?: PrintConfig,
  ) => void;

  /**
   * Marca el estado como listo para disparar react-to-print
   */
  setReady: (ready: boolean) => void;

  /**
   * Limpia el estado de impresión.
   */
  reset: () => void;
}

export const usePrinterStore = create<PrinterState>((set) => ({
  items: [],
  Template: null,
  config: null,
  isReady: false,

  print: (data, Template, config) => {
    const items = Array.isArray(data) ? data : [data];
    set({
      items,
      Template: Template as React.ComponentType<{ data: any }>,
      config: config || null,
      isReady: false,
    });
  },

  setReady: (ready) => set({ isReady: ready }),

  reset: () => set({ items: [], Template: null, config: null, isReady: false }),
}));
