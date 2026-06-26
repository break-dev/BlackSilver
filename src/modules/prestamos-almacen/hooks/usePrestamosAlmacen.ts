import { useState, useEffect, useMemo, useCallback } from "react";
import { PrestamosService } from "../service/prestamos.service";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_Prestamo } from "../../../service/responses/prestamos/prestamo";
import { useAuditoriaStore } from "../../../stores/auditoria.store";

export interface GrupoAlmacenPrestamos {
  id_almacen_prestamista: number;
  almacen_prestamista: string;
  prestamos: RES_Prestamo[];
}

export const usePrestamosAlmacen = () => {
  const { notifyError } = useNotify();
  const [prestamos, setPrestamos] = useState<RES_Prestamo[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros — solo mes y año, ya no filtra por almacén
  const [mes, setMes] = useState<string | null>(new Date().getMonth() + 1 + "");
  const [yearcito, setYearcito] = useState<string | null>(
    new Date().getFullYear() + "",
  );

  const { en_modo_auditable } = useAuditoriaStore();

  /**
   * Buscar todos los préstamos del periodo (sin filtrar por almacén)
   */
  const handleFetchPrestamos = useCallback(async () => {
    if (!mes || !yearcito) return;

    setLoading(true);
    try {
      const data = await PrestamosService.getPrestamosResumen(
        Number(mes),
        Number(yearcito),
      );
      setPrestamos(data);
    } catch {
      notifyError("No se pudieron obtener los préstamos");
    } finally {
      setLoading(false);
    }
  }, [mes, yearcito, notifyError]);

  useEffect(() => {
    handleFetchPrestamos();
  }, [handleFetchPrestamos]);

  // Filtrado local por modo auditoría
  const filteredRecords = useMemo(() => {
    return prestamos.filter((p) => !(en_modo_auditable && p.es_auditable));
  }, [prestamos, en_modo_auditable]);

  // Agrupado por almacén prestamista
  const groupedByAlmacen = useMemo<GrupoAlmacenPrestamos[]>(() => {
    const map = new Map<number, GrupoAlmacenPrestamos>();
    for (const p of filteredRecords) {
      if (!map.has(p.id_almacen_prestamista)) {
        map.set(p.id_almacen_prestamista, {
          id_almacen_prestamista: p.id_almacen_prestamista,
          almacen_prestamista: p.almacen_prestamista,
          prestamos: [],
        });
      }
      map.get(p.id_almacen_prestamista)!.prestamos.push(p);
    }
    return Array.from(map.values());
  }, [filteredRecords]);

  return {
    prestamos: filteredRecords,
    groupedByAlmacen,
    loading,
    mes,
    setMes,
    yearcito,
    setYearcito,
    handleFetchPrestamos,
  };
};
