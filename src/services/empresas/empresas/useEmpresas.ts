import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { IRespuesta } from "../../../shared/response";
import type { RES_Empresa } from "./dtos/responses";
import type { RES_UsuarioEmpresa } from "../labores/dtos/responses";
import type { DTO_CrearEmpresa } from "./dtos/requests";

export const useEmpresas = ({ setError }: IUseHook) => {
  const path = "/empresas";

  // Listar empresas
  const listar = async () => {
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_Empresa[]>>(path);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        // Prefer 'message' for user-friendly errors, aligned with Categories/Concesiones style
        setError(result.message || result.error);
        return [];
      }
    } catch (error) {
      setError(String(error));
      return [];
    }
  };

  // Crear empresa
  const crear_empresa = async (dto: DTO_CrearEmpresa) => {
    setError("");
    try {
      const response = await api.post<IRespuesta<RES_Empresa>>(path, dto);
      const result = response.data;

      if (result.success) {
        return result.data;
      } else {
        setError(result.message || result.error);
        return null;
      }
    } catch (error) {
      setError(String(error));
      return null;
    }
  };

  // (Mantener compatibilidad) Listar empresas por sesión (usado en SelectEmpresas)
  const get_empresas_by_session = async (): Promise<RES_Empresa[]> => {
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_Empresa[]>>(
        "/empresas/by-session"
      );
      const result = response.data;
      return result.data || [];
    } catch (error) {
      setError(String(error));
      return [];
    }
  };

  // Get users by company
  const get_usuarios_empresa = async (id_empresa: number): Promise<RES_UsuarioEmpresa[]> => {
    setError("");
    try {
      const response = await api.get<IRespuesta<RES_UsuarioEmpresa[]>>(
        "/empresas/usuarios",
        { params: { id_empresa } }
      );
      const result = response.data;
      if (result.success) {
        return result.data || [];
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return {
    listar,
    crear_empresa,
    get_empresas_by_session,
    get_usuarios_empresa,
  };
};
