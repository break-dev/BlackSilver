import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ControlUsoService } from "../service/control-uso.service";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_ControlUsoLog } from "../service/control-uso.responses";
import type { RES_ActivoFijoDisponible } from "../../../service/responses/activo-fijo";
import { useAuditoriaStore } from "../../../stores/auditoria.store";
export const useControlUso = () => {
  const { notifySuccess, notifyError } = useNotify();
  const { en_modo_auditable } = useAuditoriaStore();
  const [logs, setLogs] = useState<RES_ControlUsoLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Assets states
  const [activos, setActivos] = useState<RES_ActivoFijoDisponible[]>([]);
  const [idActivoFijo, setIdActivoFijo] = useState<string | null>(null);
  const [loadingActivos, setLoadingActivos] = useState(false);

  // Default values: current month and year
  const currentDate = new Date();
  const [tipoControl, setTipoControl] = useState<
    "horometro" | "odometro" | "vueltas"
  >("horometro");
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
          control_por_vueltas: tipoControl === "vueltas" ? true : undefined,
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
      (log) => log.id_activo_fijo === Number(idActivoFijo),
    );

    // Apply audit mode filter
    const baseList = assetFiltered.filter((log) => {
      if (en_modo_auditable && log.es_auditable) return false;
      return true;
    });

    const query = busqueda.toLowerCase().trim();
    if (!query) return baseList;

    return baseList.filter(
      (log) =>
        log.correlativo.toLowerCase().includes(query) ||
        (log.codigo && log.codigo.toLowerCase().includes(query)) ||
        log.producto.toLowerCase().includes(query) ||
        log.categoria.toLowerCase().includes(query),
    );
  }, [logs, idActivoFijo, busqueda, en_modo_auditable]);

  const pushNuevoLog = (nuevo: RES_ControlUsoLog & { id?: number }) => {
    // Buscar los metadatos del activo fijo seleccionado para poblar los campos JOINed en tiempo real
    const activeAsset = activos.find(
      (a) => String(a.id_activo) === String(idActivoFijo),
    );

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
      fecha_hora_fin_control: nuevo.fecha_hora_fin_control || null,
      horometro_inicio: nuevo.horometro_inicio || null,
      horometro_fin: nuevo.horometro_fin || null,
      odometro_inicio: nuevo.odometro_inicio || null,
      odometro_fin: nuevo.odometro_fin || null,
      cantidad_vueltas: nuevo.cantidad_vueltas || null,
      total_horas: nuevo.total_horas || null,
      total_km:
        nuevo.odometro_fin != null && nuevo.odometro_inicio != null
          ? Math.max(
              0,
              Number(nuevo.odometro_fin) - Number(nuevo.odometro_inicio),
            )
          : null,
      precio_unitario: nuevo.precio_unitario || null,
      costo_total: nuevo.costo_total || null,
      es_para_mina: nuevo.es_para_mina || null,
      id_mina: nuevo.id_mina || null,
      mina: nuevo.mina || null,
      id_labor: nuevo.id_labor || null,
      labor: nuevo.labor || null,
      id_cliente: nuevo.id_cliente || null,
      cliente: nuevo.cliente || null,
      ubicacion_activo: nuevo.ubicacion_activo,
      tipo_material: nuevo.tipo_material,
      tarifa_material: nuevo.tarifa_material || nuevo.tipo_material || null,
      tarifa_distancia_metros: nuevo.tarifa_distancia_metros || null,
      cantidad_sacos: nuevo.cantidad_sacos || null,
      tipo_carga: nuevo.tipo_carga || null,
      id_tarifa: nuevo.id_tarifa || null,
      tarifa_desc: nuevo.tarifa_desc || null,
      observacion: nuevo.observacion || null,
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
