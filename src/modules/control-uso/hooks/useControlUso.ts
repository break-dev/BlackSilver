import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ControlUsoService } from "../service/control-uso.service";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_ControlUsoLog } from "../service/control-uso.responses";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
export const useControlUso = () => {
  const { notifySuccess, notifyError } = useNotify();
  const [logs, setLogs] = useState<RES_ControlUsoLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Assets states
  const [activos, setActivos] = useState<RES_ActivoFijoDisponible[]>([]);
  const [idActivoFijo, setIdActivoFijo] = useState<string | null>(null);
  const [loadingActivos, setLoadingActivos] = useState(false);
  
  // Default values: current month and year
  const currentDate = new Date();
  const [tipoControl, setTipoControl] = useState<"horometro" | "odometro">("horometro");
  const [mes, setMes] = useState<number>(currentDate.getMonth() + 1); // 1-indexed (Jan = 1, Dec = 12)
  const [anio, setAnio] = useState<number>(currentDate.getFullYear());

  // Fetch available assets for this control type on mount / control type change
  useEffect(() => {
    const fetchActivos = async () => {
      setLoadingActivos(true);
      try {
        const resp = await AuxService.get_activos_disponibles({
          control_por_horometro: tipoControl === "horometro" ? true : undefined,
          control_por_odometro: tipoControl === "odometro" ? true : undefined,
        });
        if (resp.success) {
          setActivos(resp.data);
          if (resp.data.length > 0) {
            setIdActivoFijo(String(resp.data[0].id_activo));
          } else {
            setIdActivoFijo(null);
          }
        } else {
          notifyError(resp.message || "Error al cargar la lista de activos");
        }
      } catch (err) {
        notifyError("Error al conectar con el servidor para listar activos.");
        console.error(err);
      } finally {
        setLoadingActivos(false);
      }
    };

    fetchActivos();
  }, [tipoControl, notifyError]);

  const listarLogs = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await ControlUsoService.getLogs({
        tipo_control: tipoControl,
        mes,
        anio,
      });

      if (resp.success) {
        setLogs(resp.data);
      } else {
        notifyError(resp.message || "Error al cargar los registros de uso");
      }
    } catch (err) {
      notifyError("Ocurrió un error al cargar el listado de uso.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tipoControl, mes, anio, notifyError]);

  useEffect(() => {
    listarLogs();
  }, [listarLogs]);

  const filtrados = useMemo(() => {
    if (!idActivoFijo) return [];

    // Filter by currently selected active asset first
    const assetFiltered = logs.filter(
      (log) => log.id_activo_fijo === Number(idActivoFijo)
    );

    const query = busqueda.toLowerCase().trim();
    if (!query) return assetFiltered;

    return assetFiltered.filter(
      (log) =>
        log.correlativo.toLowerCase().includes(query) ||
        (log.codigo && log.codigo.toLowerCase().includes(query)) ||
        log.producto.toLowerCase().includes(query) ||
        log.categoria.toLowerCase().includes(query)
    );
  }, [logs, idActivoFijo, busqueda]);

  const pushNuevoLog = (nuevo: RES_ControlUsoLog & { id?: number }) => {
    // Buscar los metadatos del activo fijo seleccionado para poblar los campos JOINed en tiempo real
    const activeAsset = activos.find((a) => String(a.id_activo) === String(idActivoFijo));

    const fullyPopulatedLog: RES_ControlUsoLog = {
      id_log: nuevo.id || nuevo.id_log, // map database id (or id_log) to id_log
      id_activo_fijo: nuevo.id_activo_fijo,
      codigo: null, // no aplica o se deja nulo ya que RES_ActivoFijoDisponible no tiene código de barras directo aquí
      correlativo: activeAsset?.correlativo || "",
      producto: activeAsset?.producto || "",
      categoria: "", // opcional
      control_por_horometro: activeAsset?.control_por_horometro ? 1 : 0,
      control_por_odometro: activeAsset?.control_por_odometro ? 1 : 0,
      fecha_hora_inicio_control: nuevo.fecha_hora_inicio_control,
      fecha_hora_fin_control: nuevo.fecha_hora_fin_control,
      horometro_inicio: nuevo.horometro_inicio,
      horometro_fin: nuevo.horometro_fin,
      total_horas: nuevo.total_horas,
      precio_unitario: nuevo.precio_unitario,
      costo_total: nuevo.costo_total,
      observacion: nuevo.observacion,
      created_at: nuevo.created_at,
    };

    // Agregar el registro completamente poblado al inicio del listado de forma instantánea
    setLogs((prev) => [fullyPopulatedLog, ...prev]);
    notifySuccess("Registro de uso guardado correctamente");
  };

  return {
    logs: filtrados,
    loading,
    busqueda,
    setBusqueda,
    tipoControl,
    setTipoControl,
    mes,
    setMes,
    anio,
    setAnio,
    activos,
    idActivoFijo,
    setIdActivoFijo,
    loadingActivos,
    recargar: listarLogs,
    pushNuevoLog,
  };
};

export default useControlUso;
