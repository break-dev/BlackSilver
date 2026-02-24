import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { RES_RequerimientoAlmacen, RES_RequerimientoDetalleCompleto, RES_TrazabilidadEvento } from "./dtos/responses";
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

    // 3. Obtener Detalle Completo (El "Ojito")
    const obtenerDetalle = async (id: number) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_RequerimientoDetalleCompleto>>(`${path}/obtener-por-id`, {
                id_requerimiento: id
            });
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message);
            return null;
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    // 4. Trazabilidad del Item (El "Relojito")
    const obtenerTrazabilidad = async (idDetalle: number) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_TrazabilidadEvento[]>>(`${path}/detalle/trazabilidad`, {
                id_requerimiento_almacen_detalle: idDetalle
            });
            const result = response.data;
            if (result.success) return result.data;
            setError(result.message);
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // 5. Listar Almacenes por Mina
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
        obtenerTrazabilidad,
        listarAlmacenesPorMina,
    };
};
