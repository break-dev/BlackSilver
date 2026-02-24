import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { IRespuesta } from "../../../shared/response";
import type { RES_Labor, RES_TipoLabor, RES_HistorialResponsableLabor } from "./dtos/responses";
import type { DTO_CrearLabor, DTO_AsignarResponsableLabor } from "./dtos/requests";

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
                setError(result.message);
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
            setError(result.message);
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 3. Crear Labor
    const crearLabor = async (dto: DTO_CrearLabor) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Labor>>(path, dto);
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

    // 4. Historial de Responsables
    const historial_responsables = async (idLabor: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_HistorialResponsableLabor[]>>(`${path}/historial-responsables/${idLabor}`);
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message);
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 5. Asignar Responsable
    const asignar_responsable = async (dto: DTO_AsignarResponsableLabor) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<boolean>>(`${path}/asignar-responsable`, dto);
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
        listarTipos,
        crearLabor,
        historial_responsables,
        asignar_responsable
    };
};
