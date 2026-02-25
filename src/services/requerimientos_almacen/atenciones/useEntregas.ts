import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import type { IUseHook } from "../../hook.interface";
import type { RES_RequerimientoAtencionPendiente, RES_LoteDisponible } from "./dtos/responses";
import type { DTO_AtencionCambiarEstado, DTO_RegistrarEntrega } from "./dtos/requests";
import type { IRespuesta } from "../../../shared/response";

export const useEntregas = ({ setError }: IUseHook) => {
    const navigate = useNavigate();
    const path = "/requerimientos";

    // 1. Obtener Atenciones Pendientes por Almacén
    const obtenerAtencionesPendientes = async (idAlmacen: number, estado?: string) => {
        setError("");
        try {
            const res = await api.post<IRespuesta<RES_RequerimientoAtencionPendiente[]>>(`${path}/atencion/obtener-pendientes`, {
                id_almacen: idAlmacen,
                estado
            });
            if (res.data.success) return res.data.data;
            setError(res.data.message || "Error al obtener pendientes");
            return [];
        } catch (err: any) {
            if (err.response?.status === 401) navigate("/login");
            setError(err.response?.data?.message || "Error de conexión");
            return [];
        }
    };

    // 2. Cambiar Estado del Detalle (Aprobar/Rechazar)
    const cambiarEstadoDetalle = async (dto: DTO_AtencionCambiarEstado) => {
        setError("");
        try {
            const res = await api.post<IRespuesta<null>>(`${path}/atencion/cambiar-estado-detalle`, dto);
            if (res.data.success) return true;
            setError(res.data.message || "Error al cambiar estado");
            return false;
        } catch (err: any) {
            setError(err.response?.data?.message || "Error de conexión");
            return false;
        }
    };

    // 3. Obtener Lotes Disponibles para Despacho
    const obtenerLotesDisponibles = async (idProducto: number, idAlmacen: number) => {
        setError("");
        try {
            const res = await api.post<IRespuesta<RES_LoteDisponible[]>>(`${path}/atencion/obtener-lotes-disponibles`, {
                id_producto: idProducto,
                id_almacen: idAlmacen
            });
            if (res.data.success) return res.data.data;
            setError(res.data.message || "Error al obtener lotes");
            return [];
        } catch (err: any) {
            setError(err.response?.data?.message || "Error de conexión");
            return [];
        }
    };

    // 4. Registrar Entrega Física
    const registrarEntrega = async (dto: DTO_RegistrarEntrega) => {
        setError("");
        try {
            const res = await api.post<IRespuesta<null>>(`${path}/atencion/registrar-entrega`, dto);
            if (res.data.success) return true;
            setError(res.data.message || "Error al registrar entrega");
            return false;
        } catch (err: any) {
            setError(err.response?.data?.message || "Error de conexión");
            return false;
        }
    };

    return {
        obtenerAtencionesPendientes,
        cambiarEstadoDetalle,
        obtenerLotesDisponibles,
        registrarEntrega,
    };
};
