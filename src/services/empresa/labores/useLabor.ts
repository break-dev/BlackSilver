
import { api } from "../../api";
import type { IRespuesta } from "../../../shared/response";
import type { IUseHook } from "../../hook.interface";
import type {
    DTO_CrearLabor,
    DTO_EditarLabor,
    RES_Labor,
} from "./dtos/labor.dto";

export const useLabor = ({ setIsLoading, setError }: IUseHook) => {
    const path = "/api/labores";

    const listar = async (id_concesion?: number) => {
        setIsLoading(true);
        setError("");
        try {
            const url = id_concesion ? `${path}?id_concesion=${id_concesion}` : path;
            const response = await api.get<IRespuesta<RES_Labor[]>>(url);
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

    const crear = async (dto: DTO_CrearLabor) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.post<IRespuesta<RES_Labor>>(path, dto);
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

    const editar = async (dto: DTO_EditarLabor) => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.put<IRespuesta<RES_Labor>>(
                `${path}/${dto.id_labor}`,
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
