import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  REQ_ActualizarUbicacion,
  REQ_CrearActivo,
} from "./activos.requests";
import type { RES_ActivoFijoResumen } from "./activos.responses";

const path = "/activos-fijos";

export const ActivosService = {
  /**
   * Obtener el listado de activos fijos.
   */
  getActivos: async () => {
    const { data } = await api.get<IRespuesta<RES_ActivoFijoResumen[]>>(path);
    return data;
  },

  /**
   * Crear un nuevo activo fijo.
   */
  crearActivo: async (payload: REQ_CrearActivo) => {
    const { data } = await api.post<IRespuesta<RES_ActivoFijoResumen>>(
      path,
      payload,
    );
    return data;
  },

  /**
   * Actualizar la ubicación de un activo fijo.
   */
  actualizarUbicacion: async (payload: REQ_ActualizarUbicacion) => {
    const { data } = await api.post<IRespuesta<number>>(
      `${path}/ubicacion`,
      payload,
    );
    return data;
  },

  configurarAlertas: async (payload: {
    id_activo: number;
    intervalo_horas?: number | null;
    intervalo_kilometros?: number | null;
    intervalo_vueltas?: number | null;
  }) => {
    const { data } = await api.post<IRespuesta<null>>(
      `${path}/configurar-alertas`,
      payload,
    );
    return data;
  },

  registrarMantenimiento: async (payload: {
    id_activo: number;
    id_empleado_registro: number;
    tipo_control: "horometro" | "odometro" | "vueltas";
    observacion?: string | null;
  }) => {
    const { data } = await api.post<IRespuesta<null>>(
      `${path}/mantenimiento`,
      payload,
    );
    return data;
  },
};
