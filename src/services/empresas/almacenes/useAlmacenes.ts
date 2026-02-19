import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { IRespuesta } from "../../../shared/response";
import type { RES_Almacen, RES_ResponsableAlmacen, RES_LaborAsignada } from "./dtos/responses";
import type {
    DTO_CrearAlmacen,
    DTO_AsignarResponsableAlmacen,
    DTO_AsignarLaborAlmacen
} from "./dtos/requests";

export const useAlmacenes = ({ setError }: IUseHook) => {
    const path = "/api/almacenes";

    // 1. Listar Almacenes (GET /api/almacenes?id_empresa=X <- Si es relevante, o general)
    const listar = async (filters?: any) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Almacen[]>>(path, {
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

    // 2. Crear Almacen
    const crear = async (dto: DTO_CrearAlmacen) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Almacen>>(path, dto);
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message || result.error);
            return null;
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    // 3. Asignar Responsable
    const asignarResponsable = async (dto: DTO_AsignarResponsableAlmacen) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<boolean>>(`${path}/asignar-responsable`, dto);
            const result = response.data;
            if (result.success) return true;
            setError(result.message || result.error);
            return false;
        } catch (error) {
            setError(String(error));
            return false;
        }
    };

    // 4. Listar Historial de Responsables
    const listarResponsables = async (id_almacen: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_ResponsableAlmacen[]>>(`${path}/responsables`, {
                params: { id_almacen }
            });
            const result = response.data;
            if (result.success) return result.data;
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 5. Asignar Labor (Vincular Almacén a Operación)
    const asignarLabor = async (dto: DTO_AsignarLaborAlmacen) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<boolean>>(`${path}/asignar-labor`, dto);
            const result = response.data;
            if (result.success) return true;
            setError(result.message || result.error);
            return false;
        } catch (error) {
            setError(String(error));
            return false;
        }
    };

    // 6. Listar Labores Asignadas (GET /api/almacenes/labores?id_almacen=X)
    const listarLabores = async (id_almacen: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_LaborAsignada[]>>(`${path}/labores`, {
                params: { id_almacen }
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
        asignarResponsable,
        listarResponsables,
        asignarLabor,
        listarLabores
    };
};
