import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { RES_RequerimientoAlmacen } from "./dtos/responses";
import type { DTO_CrearRequerimiento } from "./dtos/requests";
import type { RES_Almacen } from "../../empresas/almacenes/dtos/responses";

export const useRequerimientos = ({ setError }: IUseHook) => {
    const path = "/requerimientos";

    // 1. Listar Requerimientos
    const listar = async (filters?: {
        id_mina?: number;
        id_almacen_destino?: number;
        estado?: string;
        fecha_inicio?: string;
        fecha_fin?: string;
    }) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_RequerimientoAlmacen[]>>(path, {
                params: filters,
            });
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message);
            return [];
        } catch (error: any) {
            // Si es 404 No Encontrado, no es realmente un error para el usuario,
            // sino que simplemente no hay registros para esa mina.
            if (error?.response?.status !== 404) {
                setError(String(error));
            }
            return [];
        }
    };

    // 2. Crear Requerimiento
    const crear = async (dto: DTO_CrearRequerimiento) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_RequerimientoAlmacen>>(path, dto);
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message);
            return null;
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    // 3. Obtener Detalle
    const obtenerDetalle = async (id: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_RequerimientoAlmacen>>(`${path}/${id}`);
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message);
            return null;
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    // 4. Listar Almacenes por Mina
    const listarAlmacenesPorMina = async (idMina: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Almacen[]>>(`${path}/almacenes`, {
                params: { id_mina: idMina }
            });
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message);
            return [];
        } catch (error: any) {
            if (error?.response?.status !== 404) {
                setError(String(error));
            }
            return [];
        }
    };

    return {
        listar,
        crear,
        obtenerDetalle,
        listarAlmacenesPorMina,
    };
};
