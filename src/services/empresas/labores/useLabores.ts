import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { IRespuesta } from "../../../shared/response";
import type { RES_Labor, RES_TipoLabor } from "./dtos/responses";
import type { DTO_CrearLabor } from "./dtos/requests";

export const useLabores = ({ setError }: IUseHook) => {
    const path = "/labores";

    // 1. Listar Labores por Mina
    const listar = async (filters?: { id_mina?: number }) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Labor[]>>(path, {
                params: filters,
            });
            const result = response.data;

            if (result.success) {
                return result.data;
            } else {
                setError(result.message || result.error);
                return [];
            }
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 2. Listar Tipos de Labor
    const listarTipos = async () => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_TipoLabor[]>>(`${path}/tipos`);
            const result = response.data;

            if (result.success) return result.data;
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 3. Crear Labor
    const crear_labor = async (dto: DTO_CrearLabor) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Labor>>(path, dto);
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

    return {
        listar,
        listarTipos,
        crear_labor,
    };
};
