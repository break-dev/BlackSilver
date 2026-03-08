import { api } from "../../shared/api";
import type { IRespuesta } from "../../shared/response";
import type { IUseHook } from "../../shared/hook.interface";
import type {
  DTO_CrearSolicitudReabastecimiento,
  RES_SolicitudReabastecimiento,
  RES_SolicitudReabastecimientoDetalle,
  RES_SolicitudDetalleCompleto,
} from "../../views/solicitudes-reabastecimiento/service/solicitudes-reabastecimiento.requests";

export const useSolicitudesReabastecimiento = ({ setError }: IUseHook) => {
  const path = "/solicitudes-reabastecimiento";

  const listar = async (filters?: { id_almacen_solicitante?: number }) => {
    setError("");
    try {
      const response = await api.get<
        IRespuesta<RES_SolicitudReabastecimiento[]>
      >(path, {
        params: filters,
      });
      const result = response.data;
      if (result.success) return result.data;
      setError(result.message);
      return [];
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        setError(String(error));
      }
      return [];
    }
  };

  const crear = async (dto: DTO_CrearSolicitudReabastecimiento) => {
    setError("");
    try {
      const response = await api.post<
        IRespuesta<RES_SolicitudReabastecimiento>
      >(path, dto);
      const result = response.data;
      if (result.success) return result.data;
      setError(result.message);
      return null;
    } catch (error) {
      setError(String(error));
      return null;
    }
  };

  const obtenerDetalle = async (id: number) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_SolicitudDetalleCompleto>>(
        `${path}/obtener-por-id`,
        {
          id_solicitud_reabastecimiento: id,
        },
      );
      const result = response.data;
      if (result.success) return result.data;
      setError(result.message);
      return null;
    } catch (error) {
      setError(String(error));
      return null;
    }
  };

  const obtenerDetallesSoloLista = async (id: number) => {
    setError("");
    try {
      const response = await api.post<
        IRespuesta<RES_SolicitudReabastecimientoDetalle[]>
      >(`${path}/obtener-detalles`, {
        id_solicitud_reabastecimiento: id,
      });
      const result = response.data;
      if (result.success) return result.data;
      setError(result.message);
      return [];
    } catch (error) {
      setError(String(error));
      return [];
    }
  };

  return {
    listar,
    crear,
    obtenerDetalle,
    obtenerDetallesSoloLista,
  };
};
