import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { IRespuesta } from "../../../shared/response";
import type { RES_Labor, RES_TipoLabor, RES_HistorialResponsableLabor } from "./dtos/responses";
import type { DTO_CrearLabor, DTO_AsignarResponsable } from "./dtos/requests";

export const useLabores = ({ setError }: IUseHook) => {
    const path = "/api/labores";

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

    // 4. Asignar Responsable
    const asignar_responsable = async (dto: DTO_AsignarResponsable) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<boolean>>(
                `/api/labor/asignar-responsable`, // Verificar endpoint exacto con backend, asumo singular 'labor' como en doc
                dto
            );
            const result = response.data;

            if (result.success) {
                return true;
            } else {
                setError(result.message || result.error);
                return false;
            }
        } catch (error) {
            setError(String(error));
            return false;
        }
    };

    // 5. Historial Responsables
    const historial_responsables = async (id_labor: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_HistorialResponsableLabor[]>>(
                `/api/labor/responsables`,
                { params: { id_labor } } // GET query param
            );
            const result = response.data;

            if (result.success) {
                return result.data;
            } else {
                return [];
            }
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    return {
        listar,
        listarTipos,
        crear_labor,
        asignar_responsable,
        historial_responsables,
    };
};
