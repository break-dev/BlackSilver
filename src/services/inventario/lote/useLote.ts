import { api } from "../../api";
import dayjs from "dayjs";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { DTO_CrearLote } from "./dtos/requests";
import type { RES_Lote, RES_ProductoDisponible, RES_UnidadMedida } from "./dtos/responses";

export const useLote = ({ setError }: IUseHook) => {

    // Obtener lotes por almacén
    const listarPorAlmacen = async (idAlmacen: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Lote[]>>(`/api/lotes-almacen`, {
                params: { id_almacen: idAlmacen }
            });
            const result = response.data;
            if (result.success) {
                return result.data;
            } else {
                setError(result.error);
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
            // Formatear fechas para el backend (YYYY-MM-DD)
            const payload = {
                ...dto,
                fecha_ingreso: dayjs(dto.fecha_ingreso).format("YYYY-MM-DD"),
                fecha_vencimiento: dto.fecha_vencimiento
                    ? dayjs(dto.fecha_vencimiento).format("YYYY-MM-DD")
                    : null
            };

            const response = await api.post<IRespuesta<any>>(`/api/lotes`, payload);
            const result = response.data;
            if (result.success) {
                return true;
            } else {
                setError(result.error || result.message || "");
                return false;
            }
        } catch (error) {
            setError(String(error));
            return false;
        }
    };

    // Listar productos aptos para inventario
    const listarProductosDisponibles = async () => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_ProductoDisponible[]>>(`/api/lotes/productos-disponibles`);
            const result = response.data;
            if (result.success) {
                return result.data;
            } else {
                setError(result.error);
                return null;
            }
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    // Listar unidades de medida
    const listarUnidadesMedida = async () => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_UnidadMedida[]>>(`/api/unidades-medida`);
            const result = response.data;
            if (result.success) {
                return result.data;
            } else {
                setError(result.error);
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
        listarUnidadesMedida
    };
};
