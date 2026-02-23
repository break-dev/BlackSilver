import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { DTO_CrearCategoria, DTO_EditarCategoria } from "./dtos/requests";
import type { RES_Categoria } from "./dtos/responses";

export const useCategoria = ({ setError }: IUseHook) => {
  const path = "/categorias";

  const listar = async () => {
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_Categoria[]>>(path);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.message || result.error || "Error");
        return null;
      }
    } catch (error) {
      setError(String(error));
      return null;
    }
  };

  const crearCategoria = async (dto: DTO_CrearCategoria) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_Categoria>>(path, dto);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
        return null;
      }
    } catch (error) {
      setError(String(error));
      return null;
    }
  };

  const editar = async (dto: DTO_EditarCategoria) => {
    setError("");
    try {
      const response = await api.put<IRespuesta<RES_Categoria>>(path, dto);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.message);
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
        data: { id },
      });
      const result = response.data;

      if (result.success) {
        return true;
      } else {
        setError(result.message || result.error || "Error");
        return false;
      }
    } catch (error) {
      setError(String(error));
      return false;
    }
  };

  return {
    listar,
    crearCategoria,
    editar,
    eliminar,
  };
};
