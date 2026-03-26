import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PrestamosService } from "../service/prestamos.service";
import type {
  RES_AlmacenSecundario,
  RES_PrestamoResumen,
} from "../service/prestamos.responses";
import { useNotify } from "../../../hooks/useNotify";

export const usePrestamosAlmacen = () => {
  const { notifyError } = useNotify();
  const [almacenes, setAlmacenes] = useState<RES_AlmacenSecundario[]>([]);
  const [prestamos, setPrestamos] = useState<RES_PrestamoResumen[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);

  // Filtros
  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [mes, setMes] = useState<string | null>(new Date().getMonth() + 1 + "");
  const [yearcito, setYearcito] = useState<string | null>(
    new Date().getFullYear() + "",
  );
  const initialized = useRef(false);

  /**
   * Cargar almacenes secundarios al iniciar
   */
  useEffect(() => {
    const fetchAlmacenes = async () => {
      setLoadingAlmacenes(true);
      try {
        const data = await PrestamosService.getAlmacenesSecundarios();
        setAlmacenes(data);
        // Selección automática del primer almacén si hay data y no se ha inicializado
        if (data.length > 0 && !initialized.current) {
          setIdAlmacen(String(data[0].id_almacen));
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

  return {
    almacenes,
    prestamos,
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
