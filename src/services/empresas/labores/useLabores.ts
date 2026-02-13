import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { IRespuesta } from "../../../shared/response";
import type { RES_Labor, RES_ResponsableLabor } from "./dtos/responses";
import type { DTO_CrearLabor, DTO_AsignarResponsable } from "./dtos/requests";

export const useLabores = ({ setError }: IUseHook) => {
    const path = "/api/labores";

    // Listar labores (optional filter by query params)
    const listar = async (filters?: { id_empresa_concesion?: number }) => {
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

    // Crear labor
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

    // Asignar Responsable
    const asignar_responsable = async (dto: DTO_AsignarResponsable) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<boolean>>(
                `/api/labor/asignar-responsable`,
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

    // Historial Responsables
    const historial_responsables = async (id_labor: number) => {
        setError("");
        try {
            // POST based on user spec: Body: { "id_labor": 10 }
            const response = await api.post<IRespuesta<RES_ResponsableLabor[]>>(
                `/api/labor/responsables`,
                { id_labor }
            );
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

    return {
        listar,
        crear_labor,
        asignar_responsable,
        historial_responsables,
    };
};
