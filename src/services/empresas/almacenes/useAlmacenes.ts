import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { IRespuesta } from "../../../shared/response";
import type { RES_Almacen, RES_ResponsableAlmacen, RES_MinaAsignada } from "./dtos/responses";
import type {
    DTO_CrearAlmacen,
    DTO_AsignarResponsableAlmacen,
    DTO_AsignarMinaAlmacen
} from "./dtos/requests";

export const useAlmacenes = ({ setError }: IUseHook) => {
    const path = "/almacenes";

    // 1. Listar Almacenes
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
            const response = await api.post<IRespuesta<RES_ResponsableAlmacen[]>>(`${path}/responsables`, {
                id_almacen
            });
            const result = response.data;
            if (result.success) return result.data;
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 5. Asignar Mina (Vincular Almacén a Mina)
    const asignarMina = async (dto: DTO_AsignarMinaAlmacen) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<boolean>>(`${path}/asignar-mina`, dto);
            const result = response.data;
            if (result.success) return true;
            setError(result.message || result.error);
            return false;
        } catch (error) {
            setError(String(error));
            return false;
        }
    };

    // 6. Listar Minas Asignadas
    const listarMinas = async (id_almacen: number) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_MinaAsignada[]>>(`${path}/minas`, {
                id_almacen
            });
            const result = response.data;
            if (result.success) return result.data;
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 7. Desvincular Mina
    const desasignarMina = async (id_asignacion: number) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<boolean>>(`${path}/desasignar-mina`, {
                id_asignacion
            });
            const result = response.data;
            if (result.success) return true;
            setError(result.message || result.error);
            return false;
        } catch (error) {
            setError(String(error));
            return false;
        }
    }

    return {
        listar,
        crear,
        asignarResponsable,
        listarResponsables,
        asignarMina,
        listarMinas,
        desasignarMina
    };
};
