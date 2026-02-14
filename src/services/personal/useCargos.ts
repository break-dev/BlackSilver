import { api } from "../api";
import type { IRespuesta } from "../../shared/response";
import type { IUseHook } from "../hook.interface";
import type { RES_Cargo } from "./dtos/responses";

export const useCargos = ({ setError }: IUseHook) => {
    const path = "/api/cargos";

    // Listar cargos
    const listar = async () => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Cargo[]>>(path);
            const result = response.data;
            if (result.success) return result.data;
            return [];
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    return { listar };
};
