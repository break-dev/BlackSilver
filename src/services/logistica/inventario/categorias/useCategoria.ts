import { api } from "../../../api";
import type { IRespuesta } from "../../../../shared/response";
import type { IUseHook } from "../../../hook.interface";
import type {
    DTO_CrearCategoria,
    DTO_EditarCategoria,
    RES_Categoria,
} from "./dtos/categoria.dto";

export const useCategoria = ({ setIsLoading, setError }: IUseHook) => {
    // Definimos el path base para la API de categorias
    const path = "/api/categorias";

    const listar = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Categoria[]>>(path);
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
        } finally {
            setIsLoading(false);
        }
    };

    const crear = async (dto: DTO_CrearCategoria) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Categoria>>(path, dto);
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
        } finally {
            setIsLoading(false);
        }
    };

    // Usamos el id de la DTO directamente, que es id
    const editar = async (dto: DTO_EditarCategoria) => {
        setIsLoading(true);
        setError("");
        try {
            // PUT /api/categorias/{id}
            const response = await api.put<IRespuesta<RES_Categoria>>(
                `${path}/${dto.id}`,
                dto,
            );
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
        } finally {
            setIsLoading(false);
        }
    };

    const eliminar = async (id: number) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.delete<IRespuesta<boolean>>(`${path}/${id}`);
            const result = response.data;

            if (result.success) {
                return true;
            } else {
                setError(result.error);
                return false;
            }
        } catch (error) {
            setError(String(error));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        listar,
        crear,
        editar,
        eliminar,
    };
};
