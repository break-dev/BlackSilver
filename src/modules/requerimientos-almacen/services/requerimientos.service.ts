import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces/menu-navegacion";
import type {
  RES_RequerimientoAlmacen,
  RES_RequerimientoDetalle,
  RES_TrazabilidadEvento,
  RES_LaborRelacionada,
  RES_Mina_Local,
  RES_Almacen_Local,
  RES_Labor_Local,
  RES_Producto_Local,
  RES_Unidad_Local,
  RES_DataRegistro,
  RES_DataByMina,
} from "./requerimientos.responses";
import type { DTO_CrearRequerimiento } from "./requerimientos.requests";

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
    const res = await api.get<IRespuesta<RES_RequerimientoDetalle[]>>(
      `${path}/detalle`,
      {
        params: { id_requerimiento: idRequerimiento },
      },
    );
    return res.data;
  },

  obtenerTrazabilidad: async (idDetalle: number) => {
    const res = await api.get<IRespuesta<RES_TrazabilidadEvento[]>>(
      `${path}/detalle-trazabilidad`,
      {
        params: { id_requerimiento_almacen_detalle: idDetalle },
      },
    );
    return res.data;
  },

  obtenerLaboresVinculadas: async (idRequerimiento: number) => {
    const res = await api.get<IRespuesta<RES_LaborRelacionada[]>>(
      `${path}/labores-requerimiento`,
      {
        params: { id_requerimiento: idRequerimiento },
      },
    );
    return res.data;
  },

  // Catálogos para el registro
  listarMinas: async () => {
    const res = await api.get<IRespuesta<RES_Mina_Local[]>>(`${path}/minas`);
    return res.data;
  },

  listarAlmacenesPorMina: async (idMina: number) => {
    const res = await api.get<IRespuesta<RES_Almacen_Local[]>>(
      `${path}/almacenes`,
      {
        params: { id_mina: idMina },
      },
    );
    return res.data;
  },

  listarLaboresPorMina: async (idMina: number) => {
    const res = await api.get<IRespuesta<RES_Labor_Local[]>>(
      `${path}/labores`,
      {
        params: { id_mina: idMina },
      },
    );
    return res.data;
  },

  listarProductos: async () => {
    const res = await api.get<IRespuesta<RES_Producto_Local[]>>(
      `${path}/productos`,
    );
    return res.data;
  },

  listarUnidades: async () => {
    const res = await api.get<IRespuesta<RES_Unidad_Local[]>>(
      `${path}/unidades`,
    );
    return res.data;
  },

  obtenerDataRegistro: async () => {
    const res = await api.get<IRespuesta<RES_DataRegistro>>(
      `${path}/data-to-registro`,
    );
    return res.data;
  },

  obtenerDataByMina: async (idMina: number) => {
    const res = await api.get<IRespuesta<RES_DataByMina>>(
      `${path}/data-by-mina`,
      {
        params: { id_mina: idMina },
      },
    );
    return res.data;
  },
};
