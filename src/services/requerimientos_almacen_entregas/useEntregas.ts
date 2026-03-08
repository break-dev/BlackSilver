import { useNavigate } from "react-router-dom";
import { api } from "../../shared/api";
import type { IUseHook } from "../../shared/hook.interface";
import type {
  RES_RequerimientoAtencionPendiente,
  RES_DetalleAtencionItem,
} from "./dtos/responses";
import type { RES_HistorialEntrega } from "../requerimientos_almacen/dtos/responses";
import type {
  DTO_AtencionCambiarEstado,
  DTO_RegistrarEntrega,
} from "./dtos/requests";
import type { IRespuesta } from "../../shared/response";

export const useEntregas = ({ setError }: IUseHook) => {
  const navigate = useNavigate();
  const path = "/requerimientos";

  // 1. Obtener Atenciones Pendientes por Almacén
  const obtenerAtencionesPendientes = async (
    idAlmacen: number,
    estado?: string,
  ) => {
    setError("");
    try {
      const res = await api.post<
        IRespuesta<RES_RequerimientoAtencionPendiente[]>
      >(`${path}/atencion/obtener-pendientes`, {
        id_almacen: idAlmacen,
        estado,
      });
      if (res.data.success) return res.data.data;
      setError(res.data.message || "Error al obtener pendientes");
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
      const res = await api.post<IRespuesta<null>>(
        `${path}/atencion/cambiar-estado-detalle`,
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

  // 3. Obtener Detalles de Atención (Ítems + Lotes)
  const obtenerDetallesAtencion = async (idRequerimiento: number) => {
    setError("");
    try {
      const res = await api.post<IRespuesta<RES_DetalleAtencionItem[]>>(
        `${path}/atencion/obtener-detalles`,
        {
          id_requerimiento: idRequerimiento,
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

  // 4. Registrar Entrega Física
  const registrarEntrega = async (dto: DTO_RegistrarEntrega) => {
    setError("");
    try {
      const res = await api.post<IRespuesta<any>>(
        `${path}/atencion/registrar-entrega`,
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

  // 5. Historial de Entregas
  const obtenerHistorialEntregas = async (idDetalle: number) => {
    setError("");
    try {
      const res = await api.post<IRespuesta<RES_HistorialEntrega[]>>(
        `${path}/atencion/obtener-historial-entregas`,
        {
          id_requerimiento_almacen_detalle: idDetalle,
        },
      );
      if (res.data.success) return res.data.data;
      return [];
    } catch (err: any) {
      return [];
    }
  };

  return {
    obtenerAtencionesPendientes,
    cambiarEstadoDetalle,
    obtenerDetallesAtencion,
    registrarEntrega,
    obtenerHistorialEntregas,
  };
};
