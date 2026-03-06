import { api } from "../api";
import dayjs from "dayjs";
import type { IRespuesta } from "../../shared/response";
import type { IUseHook } from "../hook.interface";
import type { DTO_CrearLote } from "./dtos/requests";
import type { RES_Lote, RES_ProductoDisponible, RES_UnidadMedida } from "./dtos/responses";

export const useLote = ({ setError }: IUseHook) => {

    // Obtener lotes por almacén
    const listarPorAlmacen = async (idAlmacen: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Lote[]>>(`/lotes/by-almacen`, {
                params: { id_almacen: idAlmacen }
            });
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

    // Crear nuevo lote
    const crear = async (dto: DTO_CrearLote) => {
        setError("");
        try {
            // Formatear fechas para el backend
            const payload = {
                ...dto,
                fecha_hora_ingreso: dayjs(dto.fecha_hora_ingreso).format("YYYY-MM-DD HH:mm:ss"),
                fecha_vencimiento: dto.fecha_vencimiento
                    ? dayjs(dto.fecha_vencimiento).format("YYYY-MM-DD")
                    : null
            };

            const response = await api.post<IRespuesta<RES_Lote>>(`/lotes`, payload);
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

    // Listar productos aptos para inventario
    const listarProductosDisponibles = async () => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_ProductoDisponible[]>>(`/lotes/productos-disponibles`);
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

    // Listar unidades de medida
    const listarUnidadesMedida = async (soloBase: boolean = false) => {
        setError("");
        try {
            const url = soloBase ? `/productos/unidades-base` : `/lotes/unidades-medida`;
            const response = await api.get<IRespuesta<RES_UnidadMedida[]>>(url);
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

    // Ajustar stock de un lote
    const ajustarStock = async (dto: any) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Lote>>(`/lotes/ajustar-stock`, dto);
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

    return {
        listarPorAlmacen,
        crear,
        listarProductosDisponibles,
        listarUnidadesMedida,
        ajustarStock
    };
};
