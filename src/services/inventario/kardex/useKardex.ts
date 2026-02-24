import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { RES_MovimientoKardex } from "./dtos/responses";

export const useKardex = ({ setError }: IUseHook) => {

    // Obtener movimientos de Kardex por Lote
    const listarPorLote = async (idLote: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_MovimientoKardex[]>>(`/kardex`, {
                params: { id_lote: idLote }
            });
            const result = response.data;
            if (result.success) {
                return result.data;
            } else {
                setError(result.message || "Error al obtener movimientos");
                return null;
            }
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    // Obtener movimientos de todo el almacén
    const listarPorAlmacen = async (idAlmacen: number) => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_MovimientoKardex[]>>(`/kardex`, {
                params: { id_almacen: idAlmacen }
            });
            const result = response.data;
            if (result.success) {
                return result.data;
            } else {
                setError(result.message || "Error al obtener movimientos");
                return null;
            }
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    return {
        listarPorLote,
        listarPorAlmacen
    };
};
