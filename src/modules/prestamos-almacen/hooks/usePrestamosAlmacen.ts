import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PrestamosService } from "../service/prestamos.service";
import { useNotify } from "../../../hooks/useNotify";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_Prestamo } from "../../../service/responses/prestamos/prestamo";
import { AuxService } from "../../../service/aux.service";
import { useAuditoriaStore } from "../../../stores/auditoria.store";

export const usePrestamosAlmacen = () => {
  const { notifyError } = useNotify();
  const [almacenes, setAlmacenes] = useState<RES_Almacen[]>([]);
  const [prestamos, setPrestamos] = useState<RES_Prestamo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);

  // Filtros
  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [mes, setMes] = useState<string | null>(new Date().getMonth() + 1 + "");
  const [yearcito, setYearcito] = useState<string | null>(
    new Date().getFullYear() + "",
  );
  const initialized = useRef(false);
  const { en_modo_auditable } = useAuditoriaStore();
  /**
   * Cargar almacenes secundarios al iniciar
   */
  useEffect(() => {
    const fetchAlmacenes = async () => {
      setLoadingAlmacenes(true);
      try {
        const res = await AuxService.get_almacenes({ es_principal: false });
        setAlmacenes(res.data);
        // Selección automática del primer almacén si hay data y no se ha inicializado
        if (res.data.length > 0 && !initialized.current) {
          setIdAlmacen(String(res.data[0].id_almacen));
          initialized.current = true;
        }
      } catch {
        notifyError("No se pudieron cargar los almacenes secundarios");
      } finally {
        setLoadingAlmacenes(false);
      }
    };
    fetchAlmacenes();
  }, [notifyError]);

  /**
   * Buscar préstamos cuando cambian los filtros
   */
  const handleFetchPrestamos = useCallback(async () => {
    if (!idAlmacen || !mes || !yearcito) return;

    setLoading(true);
    try {
      const data = await PrestamosService.getPrestamosResumen(
        Number(idAlmacen),
        Number(mes),
        Number(yearcito),
      );
      setPrestamos(data);
    } catch {
      notifyError("No se pudieron obtener los préstamos");
    } finally {
      setLoading(false);
    }
  }, [idAlmacen, mes, yearcito, notifyError]);

  /**
   * Trigger automático de búsqueda
   */
  useEffect(() => {
    handleFetchPrestamos();
  }, [handleFetchPrestamos]);

  const puedeBuscar = useMemo(() => {
    return idAlmacen && mes && yearcito;
  }, [idAlmacen, mes, yearcito]);

  // --------------------------------------------------
  // Filtrado local por búsqueda
  // --------------------------------------------------
  const filteredRecords = useMemo(() => {
    return prestamos.filter((p) => !(en_modo_auditable && p.es_auditable));
  }, [prestamos, en_modo_auditable]);

  return {
    almacenes,
    prestamos: filteredRecords,
    loading,
    loadingAlmacenes,
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
    handleFetchPrestamos,
    puedeBuscar,
  };
};
