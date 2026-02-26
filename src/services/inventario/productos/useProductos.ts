import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type { DTO_CrearProducto } from "./dtos/requests";
import type { RES_Producto } from "./dtos/responses";

export const useProductos = ({ setError }: IUseHook) => {
    const path = "/productos";

    const listar = async () => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Producto[]>>(path);
            const result = response.data;

            if (result.success) {
                return result.data;
            } else {
                setError(result.message || "Error al listar productos");
                return null;
            }
        } catch (error) {
            setError(String(error));
            console.error(error);
            return null;
        }
    };

    const crear = async (dto: DTO_CrearProducto) => {
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Producto>>(path, dto);
            const result = response.data;

            if (result.success) {
                return result.data;
            } else {
                setError(result.message || "Error al crear producto");
                return null;
            }
        } catch (error) {
            setError(String(error));
            console.error(error);
            return null;
        }
    };

    return {
        listar,
        crear,
    };
};
