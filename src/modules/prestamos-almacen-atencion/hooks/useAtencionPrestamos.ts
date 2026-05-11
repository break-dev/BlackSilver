import { useState, useCallback, useMemo, useEffect } from "react";
import dayjs from "dayjs";
import type { RES_Prestamo } from "../../../service/responses/prestamos/prestamo";
import { PrestamosAtencionService } from "../service/prestamos-atencion.service";
import { useNotify } from "../../../hooks/useNotify";
import { AuxService } from "../../../service/aux.service";
import { useAuthStore } from "../../../stores/auth.store";
import { useAuditoriaStore } from "../../../stores/auditoria.store";

export const useAtencionPrestamos = () => {
  const { en_modo_auditable } = useAuditoriaStore();
  const { notifyError } = useNotify();

  // -- Almacenes del empleado --
  const [almacenes, setAlmacenes] = useState<
    { id_almacen: number; nombre: string }[]
  >([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);

  // -- Filtros de la vista --
  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [mes, setMes] = useState<string>(dayjs().format("M"));
  const [yearcito, setYearcito] = useState<string>(dayjs().format("YYYY"));
  const [busqueda, setBusqueda] = useState("");

  // -- Datos de la tabla --
  const [prestamos, setPrestamos] = useState<RES_Prestamo[]>([]);
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // Cargar almacenes autorizados del empleado
  // --------------------------------------------------
  const obtenerAlmacenesAutorizados = useCallback(async () => {
    setLoadingAlmacenes(true);
    try {
      const res = await AuxService.get_almacenes({
        id_empleado_responsable: useAuthStore.getState().usuario?.id_empleado,
        es_principal: false,
      });
      if (res.success) {
        setAlmacenes(res.data);
        // Si hay almacenes, seleccionamos el primero por defecto
        if (res.data.length > 0) {
          setIdAlmacen((prev) => prev || res.data[0].id_almacen.toString());
        }
      }
    } catch {
      notifyError("No se pudieron cargar los almacenes autorizados");
    } finally {
      setLoadingAlmacenes(false);
    }
  }, [notifyError]); // Quitamos idAlmacen de aquí para evitar ciclos

  // --------------------------------------------------
  // Cargar préstamos por almacén + periodo
  // --------------------------------------------------
  const cargarPrestamos = useCallback(async () => {
    if (!idAlmacen || !mes || !yearcito) return;
    setLoading(true);
    try {
      const res = await PrestamosAtencionService.obtenerPrestamos(
        idAlmacen,
        mes,
        yearcito,
      );
      if (res.success) {
        setPrestamos(res.data ?? []);
      }
    } catch {
      setPrestamos([]);
      notifyError("Error al cargar el listado de préstamos");
    } finally {
      setLoading(false);
    }
  }, [idAlmacen, mes, yearcito, notifyError]);

  useEffect(() => {
    obtenerAlmacenesAutorizados();
  }, [obtenerAlmacenesAutorizados]);

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  // --------------------------------------------------
  // Filtrado local por búsqueda
  // --------------------------------------------------
  const filteredRecords = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    const result = prestamos.filter(
      (p) => !(en_modo_auditable && p.es_auditable),
    );
    if (!q) return result;
    return result.filter(
      (p) =>
        p.correlativo.toLowerCase().includes(q) ||
        p.almacen_solicitante.toLowerCase().includes(q) ||
        p.registrado_por.toLowerCase().includes(q),
    );
  }, [prestamos, busqueda, en_modo_auditable]);

  return {
    // estado
    almacenes,
    loadingAlmacenes,
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
    busqueda,
    setBusqueda,
    prestamos,
    filteredRecords,
    loading,
    // métodos
    cargarPrestamos,
  };
};
