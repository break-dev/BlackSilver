import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { IRespuesta } from "../../../shared/response";
import type { DTO_CrearMina, DTO_AsignarEmpresaMina } from "./dtos/requests";
import type { RES_Mina } from "./dtos/responses";
import type { RES_Empresa } from "../empresas/dtos/responses";

export const useMinas = ({ setError }: IUseHook) => {
    const path = "/api/minas";

    // 1. Listar Minas (Opcional: ?id_concesion=X)
    const listar = async (filters?: { id_concesion?: number }) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Mina[]>>(path, {
                params: filters
            });
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message || result.error);
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 2. Crear Mina (POST /api/minas) -> Devuelve objeto completo
    const crear = async (dto: DTO_CrearMina) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Mina>>(path, dto);
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message || result.error);
            return null;
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    // 3. Asignar Empresa (POST /api/minas/asignar-empresa)
    const asignarEmpresa = async (dto: DTO_AsignarEmpresaMina) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<boolean>>(`${path}/asignar-empresa`, dto);
            const result = response.data;
            if (result.success) return true;
            setError(result.message || result.error);
            return false;
        } catch (error) {
            setError(String(error));
            return false;
        }
    };

    // 4. Listar Empresas Asignadas a Mina
    const listarEmpresasAsignadas = async (id_mina: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Empresa[]>>(`${path}/empresas`, {
                params: { id_mina }
            });
            const result = response.data;
            if (result.success) return result.data;
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    return {
        listar,
        crear,
        asignarEmpresa,
        listarEmpresasAsignadas
    };
};
