import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { DTO_CrearRequerimiento } from "./requerimientos.requests";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";
import type { RES_Labor } from "../../../service/responses/labor";
import type { RES_Mina } from "../../../service/responses/mina";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type {
  RES_DetalleRequerimiento,
  RES_RequerimientoAlmacen,
} from "../../../service/responses/requerimientos-almacen/requerimiento-almacen";
import type { RES_Producto } from "../../../service/responses/producto";

const path = "/requerimientos-almacen";

export const RequerimientosService = {
  listar: async (filters: { mes?: string; yearcito?: string }) => {
    const res = await api.get<IRespuesta<RES_RequerimientoAlmacen[]>>(path, {
      params: filters,
    });
    return res.data;
  },

  crear: async (dto: DTO_CrearRequerimiento) => {
    const res = await api.post<IRespuesta<RES_RequerimientoAlmacen>>(path, dto);
    return res.data;
  },

  obtenerDetalles: async (idRequerimiento: number) => {
    const res = await api.get<IRespuesta<RES_DetalleRequerimiento[]>>(
      `${path}/detalle`,
      {
        params: { id_requerimiento: idRequerimiento },
      },
    );
    return res.data;
  },

  obtenerTrazabilidad: async (idDetalle: number) => {
    const res = await api.get<IRespuesta<RES_Trazabilidad[]>>(
      `${path}/detalle-trazabilidad`,
      {
        params: { id_requerimiento_almacen_detalle: idDetalle },
      },
    );
    return res.data;
  },

  obtenerLaboresVinculadas: async (idRequerimiento: number) => {
    const res = await api.get<IRespuesta<RES_Labor[]>>(
      `${path}/labores-requerimiento`,
      {
        params: { id_requerimiento: idRequerimiento },
      },
    );
    return res.data;
  },

  // Catálogos para el registro
  listarMinas: async () => {
    const res = await api.get<IRespuesta<RES_Mina[]>>(`${path}/minas`);
    return res.data;
  },

  listarAlmacenesPorMina: async (idMina: number) => {
    const res = await api.get<IRespuesta<RES_Almacen[]>>(`${path}/almacenes`, {
      params: { id_mina: idMina },
    });
    return res.data;
  },

  listarLaboresPorMina: async (idMina: number) => {
    const res = await api.get<IRespuesta<RES_Labor[]>>(`${path}/labores`, {
      params: { id_mina: idMina },
    });
    return res.data;
  },

  listarProductos: async () => {
    const res = await api.get<IRespuesta<RES_Producto[]>>(`${path}/productos`);
    return res.data;
  },

  listarUnidades: async () => {
    const res = await api.get<IRespuesta<RES_UnidadMedida[]>>(
      `${path}/unidades`,
    );
    return res.data;
  },

  obtenerDataRegistro: async () => {
    const res = await api.get<
      IRespuesta<{
        minas: RES_Mina[];
        productos: RES_Producto[];
        unidades: RES_UnidadMedida[];
      }>
    >(`${path}/data-to-registro`);
    return res.data;
  },

  obtenerDataByMina: async (idMina: number) => {
    const res = await api.get<
      IRespuesta<{ almacenes: RES_Almacen[]; labores: RES_Labor[] }>
    >(`${path}/data-by-mina`, {
      params: { id_mina: idMina },
    });
    return res.data;
  },
};
