import { api } from "../api";
import type { IRespuesta } from "../../shared/response";
import type { IUseHook } from "../hook.interface";
import type { RES_Empresa } from "./dtos/empresa.dto";

export const useEmpresa = ({ setIsLoading, setError }: IUseHook) => {
    // Listar todas las empresas para selects
    const listar = async () => {
        setIsLoading(true);
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Empresa[]>>("/api/empresas");
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

    return {
        listar,
    };
};
