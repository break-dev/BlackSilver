import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  RES_RequerimientoAtencionPendiente,
  RES_DetalleAtencionItem,
} from "../service/atencion.responses";

export interface RES_HistorialEntrega {
  id_entrega: number;
  codigo_entrega: string;
  id_lote_producto: number;
  cantidad: number;
  fecha_entrega: string;
  created_at: string;
  empleado: string;
  entregado_a: string;
}
import type {
  DTO_AtencionCambiarEstado,
  DTO_RegistrarEntrega,
} from "../service/atencion.requests";
import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";

export interface IUseHook {
  setError: (msg: string) => void;
}

export const useEntregas = ({ setError }: IUseHook) => {
  const navigate = useNavigate();
  const [almacenes, setAlmacenes] = useState<{ id_almacen: number; nombre: string }[]>([]);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);

  const path = "/requerimientos-atencion";

  // 0. Obtener Almacenes Autorizados (donde es responsable)
  const obtenerAlmacenesAutorizados = async () => {
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
  };

  // 1. Obtener Requerimientos por Almacén y Periodo
  const obtenerRequerimientos = async (
    idAlmacen: number,
    mes: string,
    yearcito: string,
  ) => {
    setError("");
    try {
      const res = await api.get<
        IRespuesta<RES_RequerimientoAtencionPendiente[]>
      >(`${path}/requerimientos`, {
        params: { id_almacen: idAlmacen, mes, yearcito },
      });
      if (res.data.success) return res.data.data;
      setError(res.data.message || "Error al obtener requerimientos");
      return [];
    } catch (err: any) {
      if (err.response?.status === 401) navigate("/login");
      setError(err.response?.data?.message || "Error de conexión");
      return [];
    }
  };

  // 2. Cambiar Estado del Detalle (Aprobar/Rechazar)
  const cambiarEstadoDetalle = async (dto: DTO_AtencionCambiarEstado) => {
    setError("");
    try {
      const res = await api.put<IRespuesta<null>>(
        `${path}/save-decision-detalle`,
        dto,
      );
      if (res.data.success) return true;
      setError(res.data.message || "Error al cambiar estado");
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error de conexión");
      return false;
    }
  };

  // 3. Obtener Detalles de un Requerimiento
  const obtenerDetallesRequerimiento = async (idRequerimiento: number) => {
    setError("");
    try {
      const res = await api.get<IRespuesta<RES_DetalleAtencionItem[]>>(
        `${path}/detalles-by-requerimiento`,
        {
          params: { id_requerimiento: idRequerimiento },
        },
      );
      if (res.data.success) return res.data.data;
      setError(res.data.message || "Error al obtener detalles");
      return [];
    } catch (err: any) {
      setError(err.response?.data?.message || "Error de conexión");
      return [];
    }
  };

  // 4. Obtener Lotes Disponibles
  const obtenerLotesDisponibles = async (idProducto: number, idAlmacen: number) => {
    setError("");
    try {
      const res = await api.get<IRespuesta<any[]>>(
        `${path}/lotes`,
        {
          params: { id_producto: idProducto, id_almacen: idAlmacen },
        },
      );
      if (res.data.success) return res.data.data;
      return [];
    } catch (err: any) {
      setError(err.response?.data?.message || "Error de conexión");
      return [];
    }
  };

  // 5. Registrar Entrega Física
  const registrarEntrega = async (dto: DTO_RegistrarEntrega) => {
    setError("");
    try {
      const res = await api.post<IRespuesta<any>>(
        `${path}/save-entrega`,
        dto,
      );
      if (res.data.success) return true;
      setError(res.data.message || "Error al registrar entrega");
      return false;
    } catch (err: any) {
      setError(err.response?.data?.message || "Error de conexión");
      return false;
    }
  };

  // 6. Historial de Entregas
  const obtenerHistorialEntregas = async (idDetalle: number) => {
    setError("");
    try {
      const res = await api.get<IRespuesta<RES_HistorialEntrega[]>>(
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
  };

  // 7. Obtener Trazabilidad de un Detalle
  const obtenerTrazabilidad = async (idDetalle: number) => {
    setError("");
    try {
      const res = await api.get<IRespuesta<any[]>>(
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
  };

  return {
    obtenerRequerimientos,
    cambiarEstadoDetalle,
    obtenerDetallesRequerimiento,
    obtenerLotesDisponibles,
    registrarEntrega,
    obtenerHistorialEntregas,
    obtenerTrazabilidad,
    obtenerAlmacenesAutorizados,
    almacenes,
    loadingAlmacenes,
  };
};
