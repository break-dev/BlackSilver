import { useState, useCallback, useMemo, useEffect } from "react";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import type {
  RES_RequerimientoAlmacen,
  RES_DetalleRequerimiento,
  RES_Entrega,
  RES_Empleado,
  RES_Lote,
  RES_Trazabilidad
} from "../service/atencion.responses";

import type {
  DTO_AtencionCambiarEstado,
  DTO_RegistrarEntrega,
} from "../service/atencion.requests";
import { useDisclosure } from "@mantine/hooks";
import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";

export interface IUseHook {
  setError: (msg: string) => void;
}

export const useEntregas = ({ setError: externalSetError }: IUseHook) => {
  const navigate = useNavigate();
  
  // -- Estados de Catálogos --
  const [almacenes, setAlmacenes] = useState<{ id_almacen: number; nombre: string }[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);

  // -- Estados de la Vista (Atención Page) --
  const [idAlmacen, setIdAlmacen] = useState<string | null>(null);
  const [mes, setMes] = useState<string>(dayjs().format("M"));
  const [yearcito, setYearcito] = useState<string>(dayjs().format("YYYY"));
  
  const [data, setData] = useState<RES_RequerimientoAlmacen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [openedGestion, { open: openGestion, close: closeGestion }] = useDisclosure(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const path = "/requerimientos-atencion";

  // Sincronizar error externo si es necesario
  useEffect(() => {
    if (error && externalSetError) externalSetError(error);
  }, [error, externalSetError]);


  // 0. Obtener Almacenes Autorizados (donde es responsable)
  const obtenerAlmacenesAutorizados = useCallback(async () => {
    setLoadingAlmacenes(true);
    try {
      const res = await api.get<IRespuesta<{ id_almacen: number; nombre: string }[]>>(
        `${path}/almacenes-autorizados`
      );
      if (res.data.success) {
        setAlmacenes(res.data.data);
        return res.data.data;
      }
      return [];
    } catch {
      return [];
    } finally {
      setLoadingAlmacenes(false);
    }
  }, [path]);

  // 0.1 Obtener Empleados para esta vista (quien recibe)
  const obtenerEmpleados = useCallback(async () => {
    try {
      const res = await api.get<IRespuesta<RES_Empleado[]>>(`${path}/empleados`);
      if (res.data.success) return res.data.data;
      return [];
    } catch {
      return [];
    }
  }, [path]);

  // 2. Cambiar Estado del Detalle (Aprobar/Rechazar)
  const cambiarEstadoDetalle = useCallback(async (dto: DTO_AtencionCambiarEstado) => {
    setError("");
    try {
      const res = await api.put<IRespuesta<null>>(
        `${path}/save-decision-detalle`,
        dto,
      );
      if (res.data.success) return true;
      setError(res.data.message || "Error al cambiar estado");
      return false;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
      return false;
    }
  }, [path]);

  // 3. Obtener Detalles de un Requerimiento
  const obtenerDetallesRequerimiento = useCallback(async (idRequerimiento: number) => {
    setError("");
    try {
      const res = await api.get<IRespuesta<RES_DetalleRequerimiento[]>>(
        `${path}/detalles-by-requerimiento`,
        {
          params: { id_requerimiento: idRequerimiento },
        },
      );
      if (res.data.success) return res.data.data;
      setError(res.data.message || "Error al obtener detalles");
      return [];
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
      return [];
    }
  }, [path]);

  // 4. Obtener Lotes Disponibles
  const obtenerLotesDisponibles = useCallback(async (idProducto: number, idAlmacen: number) => {
    setError("");
    try {
      const res = await api.get<IRespuesta<RES_Lote[]>>(
        `${path}/lotes`,
        {
          params: { id_producto: idProducto, id_almacen: idAlmacen },
        },
      );
      if (res.data.success) return res.data.data;
      return [];
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
      return [];
    }
  }, [path]);

  // 5. Registrar Entrega Física
  const registrarEntrega = useCallback(async (dto: DTO_RegistrarEntrega) => {
    setError("");
    try {
      const res = await api.post<IRespuesta<null>>(
        `${path}/save-entrega`,
        dto,
      );
      if (res.data.success) return true;
      setError(res.data.message || "Error al registrar entrega");
      return false;
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || "Error de conexión");
      return false;
    }
  }, [path]);

  // 6. Historial de Entregas
  const obtenerHistorialEntregas = useCallback(async (idDetalle: number) => {
    setError("");
    try {
      const res = await api.get<IRespuesta<RES_Entrega[]>>(
        `${path}/entregas`,
        {
          params: { id_requerimiento_almacen_detalle: idDetalle },
        },
      );
      if (res.data.success) return res.data.data;
      return [];
    } catch {
      return [];
    }
  }, [path]);

  // 7. Obtener Trazabilidad de un Detalle
  const obtenerTrazabilidad = useCallback(async (idDetalle: number) => {
    setError("");
    try {
      const res = await api.get<IRespuesta<RES_Trazabilidad[]>>(
        `${path}/trazabilidad`,
        {
          params: { id_requerimiento_almacen_detalle: idDetalle },
        },
      );
      if (res.data.success) return res.data.data;
      return [];
    } catch {
      return [];
    }
  }, [path]);

  // -- Lógica de Carga de Datos --
  const loadData = useCallback(async () => {
    if (!idAlmacen || !mes || !yearcito) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get<IRespuesta<RES_RequerimientoAlmacen[]>>(
        `${path}/requerimientos`,
        { params: { id_almacen: idAlmacen, mes, yearcito } }
      );
      if (res.data.success) {
        setData(res.data.data || []);
      } else {
        setError(res.data.message || "Error al obtener requerimientos");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 401) navigate("/login");
      setError(axiosError.response?.data?.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [idAlmacen, mes, yearcito, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // -- Filtrado --
  const filteredRecords = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.correlativo.toLowerCase().includes(q) ||
        item.solicitante.toLowerCase().includes(q) ||
        item.mina.toLowerCase().includes(q)
    );
  }, [data, busqueda]);

  return {
    // Estados
    idAlmacen,
    setIdAlmacen,
    mes,
    setMes,
    yearcito,
    setYearcito,
    busqueda,
    setBusqueda,
    data,
    filteredRecords,
    loading,
    error,
    setError,
    
    // Métodos
    loadData,
    cambiarEstadoDetalle,
    obtenerDetallesRequerimiento,
    obtenerLotesDisponibles,
    registrarEntrega,
    obtenerHistorialEntregas,
    obtenerTrazabilidad,
    obtenerAlmacenesAutorizados,
    obtenerEmpleados,
    
    // UI Estados
    openedGestion,
    openGestion,
    closeGestion,
    selectedId,
    setSelectedId,
    
    // Catálogos
    almacenes,
    loadingAlmacenes,
  };
};
