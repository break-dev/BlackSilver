import { api } from "../api";
import type { IRespuesta } from "../../shared/response";
import type { IUseHook } from "../hook.interface";
import type { RES_Empleado } from "./dtos/responses";
import type { DTO_CrearEmpleado } from "./dtos/requests";

export const useEmpleados = ({ setError }: IUseHook) => {
    const path = "/api/empleados";

    // Listar todos los empleados
    const listar = async () => {
        setError("");
        try {
            const response = await api.get<IRespuesta<RES_Empleado[]>>(path);
            const result = response.data;

            if (result.success) {
                return result.data;
            } else {
                setError(result.error || "Error al listar empleados");
                return [];
            }
        } catch (error) {
            setError(String(error));
            return [];
        }
    };

    // Crear nuevo empleado
    const crear = async (dto: DTO_CrearEmpleado) => {
        setError("");
        try {
            // Backend espera JSON normal, foto como string opcional (URL)
            const response = await api.post<IRespuesta<RES_Empleado>>(path, dto);
            const result = response.data;

            if (result.success) {
                return result.data;
            } else {
                setError(result.error); // Mensajes como 'DNI duplicado' vendrán acá
                return null;
            }
        } catch (error) {
            setError(String(error));
            return null;
        }
    };

    // Eliminar (Soft Delete)
    const eliminar = async (id: number) => {
        setError("");
        try {
            const response = await api.delete<IRespuesta<boolean>>(`${path}/${id}`);
            if (response.data.success) return true;
            setError(response.data.error);
            return false;
        } catch (err) {
            setError(String(err));
            return false;
        }
    };

    return {
        listar,
        crear,
        eliminar
    };
};
