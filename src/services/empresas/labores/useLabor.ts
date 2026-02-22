import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { DTO_CrearLabor, DTO_EditarLabor } from "./dtos/requests";
import type { RES_Labor } from "./dtos/responses";

export const useLabor = ({ setError }: IUseHook) => {
  const path = "/labores";

  const listar = async () => {
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_Labor[]>>(path);
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
    }
  };

  const crear_labor = async (dto: DTO_CrearLabor) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_Labor>>(path, dto);
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
    }
  };

  const editar = async (dto: DTO_EditarLabor) => {
    setError("");
    try {
      const response = await api.put<IRespuesta<RES_Labor>>(path, dto);
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
    }
  };

  const eliminar = async (id: number) => {
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
    }
  };

  return {
    listar,
    crear_labor,
    editar,
    eliminar,
  };
};
