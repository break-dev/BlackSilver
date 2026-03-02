import { api } from "../api";
import type { IUseHook } from "../hook.interface";
import type { IRespuesta } from "../../shared/response";
import type {
  RES_Almacen,
  RES_ResponsableAlmacen,
  RES_MinaAsignada,
} from "./dtos/responses";
import type {
  DTO_CrearAlmacen,
  DTO_AsignarResponsableAlmacen,
  DTO_AsignarMinaAlmacen,
} from "./dtos/requests";

export const useAlmacenes = ({ setError }: IUseHook) => {
  const path = "/almacenes";

  const listar = async () => {
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_Almacen[]>>(path);
      const result = response.data;
      if (result.success) return result.data;
      setError(result.message);
      return [];
    } catch (error) {
      setError(String(error));
      return [];
    }
  };

  // Crear Almacen
  const crear = async (dto: DTO_CrearAlmacen) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_Almacen>>(path, dto);
      const result = response.data;
      if (result.success) return result.data;
      setError(result.message);
      return null;
    } catch (error) {
      setError(String(error));
      return null;
    }
  };

  // Asignar Responsable
  const asignarResponsable = async (dto: DTO_AsignarResponsableAlmacen) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<boolean>>(
        `${path}/asignar-responsable`,
        dto,
      );
      const result = response.data;
      if (!result.success) setError(result.message);
      return result;
    } catch (error) {
      const msg = String(error);
      setError(msg);
      return { success: false, message: msg, data: false };
    }
  };

  // Listar Historial de Responsables
  const listarResponsables = async (id_almacen: number) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_ResponsableAlmacen[]>>(
        `${path}/responsables`,
        {
          id_almacen,
        },
      );
      const result = response.data;
      if (result.success) return result.data;
      setError(result.message);
      return [];
    } catch (error) {
      setError(String(error));
      return [];
    }
  };

  // Asignar mina a abastecer
  const asignarMina = async (dto: DTO_AsignarMinaAlmacen) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<boolean>>(
        `${path}/asignar-mina`,
        dto,
      );
      const result = response.data;
      if (result.success) return true;
      setError(result.message);
      return false;
    } catch (error) {
      setError(String(error));
      return false;
    }
  };

  // Listar Minas que abastece un almacen
  const listarMinas = async (id_almacen: number) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_MinaAsignada[]>>(
        `${path}/minas`,
        {
          id_almacen,
        },
      );
      const result = response.data;
      if (result.success) return result.data;
      setError(result.message);
      return [];
    } catch (error) {
      setError(String(error));
      return [];
    }
  };

  // dejar de abastecer a una mina
  const desasignarMina = async (id_asignacion: number) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<boolean>>(
        `${path}/desasignar-mina`,
        {
          id_asignacion,
        },
      );
      const result = response.data;
      if (result.success) return true;
      setError(result.message);
      return false;
    } catch (error) {
      setError(String(error));
      return false;
    }
  };

  return {
    listar,
    crear,
    asignarResponsable,
    listarResponsables,
    asignarMina,
    listarMinas,
    desasignarMina,
  };
};
