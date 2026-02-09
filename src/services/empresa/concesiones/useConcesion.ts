import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type {
    DTO_CrearConcesion,
    DTO_EditarConcesion,
    RES_Concesion,
} from "./dtos/concesion.dto";

export const useConcesion = ({ setIsLoading, setError }: IUseHook) => {
    const path = "/api/concesiones"; // Asumo ruta estándar, confirmar con usuario

    // Listar concesiones (opcional: filtrar por id_empresa)
    const listar = async (id_empresa?: number) => {
        setIsLoading(true);
        setError("");
        try {
            // Si el back soporta filtro por query param: /api/concesiones?id_empresa=1
            const url = id_empresa ? `${path}?id_empresa=${id_empresa}` : path;
            const response = await api.get<IRespuesta<RES_Concesion[]>>(url);
            const result = response.data;

            if (result.success) {
                return result.data;
            } else {
                setError(result.error);
                return [];
            }
        } catch (error) {
            setError(String(error));
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    // Crear concesion
    const crear = async (dto: DTO_CrearConcesion) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Concesion>>(path, dto);
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

    // Editar concesion (preparado para futuro)
    const editar = async (dto: DTO_EditarConcesion) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.put<IRespuesta<RES_Concesion>>(
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

    // Eliminar concesion (preparado para futuro)
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
