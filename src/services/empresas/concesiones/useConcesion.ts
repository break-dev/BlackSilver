import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { RES_Concesion } from "./dtos/responses";
import type { DTO_CrearConcesion, DTO_EditarConcesion } from "./dtos/requests";

export const useConcesion = ({ setIsLoading, setError }: IUseHook) => {
  const path = "/api/concesiones";

  // Listar concesiones
  const listar = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_Concesion[]>>(path);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return [];
      }
    } catch (error) {
      setError(String(error));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Crear concesion
  const crear_concesion = async (dto: DTO_CrearConcesion) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_Concesion>>(path, dto);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (error) {
      setError(String(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Editar concesion
  const editar = async (dto: DTO_EditarConcesion) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.put<IRespuesta<RES_Concesion>>(path, dto);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (error) {
      setError(String(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar concesion
  const eliminar = async (id: number) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await api.delete<IRespuesta<boolean>>(path, {
        data: { id: id },
      });
      const result = response.data;

      if (result.success) {
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (error) {
      setError(String(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Listar concesiones por empresa
  const get_by_empresa = async (id_empresa: number) => {
    // setIsLoading(true); // Opcional: manejar loading independiente si se desea
    try {
      // Nota: El usuario indicó: GET /api/concesiones/by-empresa?id_empresa=X
      // Ajustamos el path y parámetos según esa indicación.
      const response = await api.get<IRespuesta<RES_Concesion[]>>(`${path}/by-empresa`, {
        params: { id_empresa },
      });
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        console.error(result.error);
        return [];
      }
    } catch (error) {
      console.error(String(error));
      return [];
    }
  };

  return {
    listar,
    crear_concesion,
    editar,
    eliminar,
    get_by_empresa,
  };
};
