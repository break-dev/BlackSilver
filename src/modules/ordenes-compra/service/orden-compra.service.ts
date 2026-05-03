import { api } from "../../../service/_api";
import type { RES_Trazabilidad } from "../../../service/responses/_generic/trazabilidad";
import type {
  RES_LoteDisponible,
  RES_TicketLote,
} from "../../../service/responses/lote-producto";
import type {
  RES_OrdenCompra,
  RES_OrdenCompraDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra";
import type { RES_OrdenCompraRecepcion } from "../../../service/responses/ordenes-compra/orden-compra-recepcion";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { REQ_RegistrarRecepcionOC } from "./recepcion.requests";
import type { RES_Almacen } from "../../../service/responses/almacen";
import type { RES_PersonalExterno } from "../../../service/responses/personal-externo";

const path = "/ordenes-compra";

export const OrdenCompraService = {
  get_ordenes: async (filters: {
    mes?: string | number | null;
    year?: string | number | null;
    search?: string;
  }) => {
    const res = await api.get<IRespuesta<RES_OrdenCompra[]>>(path, {
      params: filters,
    });
    return res.data;
  },

  get_detalles: async (idOrdenCompra: number) => {
    const res = await api.get<IRespuesta<RES_OrdenCompraDetalle[]>>(
      `${path}/detalles`,
      {
        params: { id_orden_compra: idOrdenCompra },
      },
    );
    return res.data;
  },

  get_seguimiento: async (idDetalle: number) => {
    const res = await api.get<IRespuesta<RES_Trazabilidad[]>>(
      `${path}/seguimiento`,
      {
        params: { id_orden_compra_detalle: idDetalle },
      },
    );
    return res.data;
  },

  getHistorialRecepciones: async (
    idOrdenCompra: number,
  ): Promise<IRespuesta<RES_OrdenCompraRecepcion[]>> => {
    const { data } = await api.get(`${path}/recepciones/${idOrdenCompra}`);
    return data;
  },

  registrarRecepcion: async (
    dto: REQ_RegistrarRecepcionOC,
    evidencias: File[],
  ): Promise<IRespuesta<RES_TicketLote[]>> => {
    const formData = new FormData();
    formData.append("id_orden_compra", dto.id_orden_compra.toString());
    formData.append(
      "id_almacen_recepcionista",
      dto.id_almacen_recepcionista.toString(),
    );
    formData.append("con_incidencia", dto.con_incidencia ? "1" : "0");
    formData.append("observacion", dto.observacion ?? "");
    formData.append("fecha_hora_recepcion", dto.fecha_hora_recepcion);
    formData.append("serie_guia", dto.serie_guia ?? "");
    formData.append("numero_guia", dto.numero_guia ?? "");
    formData.append("items", JSON.stringify(dto.items));

    evidencias.forEach((file) => {
      formData.append("evidencias[]", file);
    });

    const { data } = await api.post(`${path}/recepciones`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  /**
   * Catálogos aislados para recepción de OC
   */
  getAlmacenes: async (): Promise<IRespuesta<RES_Almacen[]>> => {
    const { data } = await api.get(`${path}/aux/almacenes`);
    return data;
  },

  getLotesParaRecepcion: async (
    idAlmacen: number,
    idProductos: number[],
  ): Promise<IRespuesta<RES_LoteDisponible[]>> => {
    const { data } = await api.get(`${path}/aux/lotes-destino`, {
      params: {
        id_almacen_recepcionista: idAlmacen,
        id_productos: idProductos,
      },
    });
    return data;
  },

  getLotesDisponiblesTransferencia: async (
    idAlmacen: number,
    idProductos: number[],
  ): Promise<IRespuesta<RES_LoteDisponible[]>> => {
    const { data } = await api.get(`${path}/aux/lotes-destino`, {
      params: {
        id_almacen_recepcionista: idAlmacen,
        id_productos: idProductos,
      },
    });
    return data;
  },

  registrarTransferencia: async (
    data: Record<string, unknown>,
    evidencias: File[],
  ) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "detalles") {
        (value as Record<string, unknown>[]).forEach((item, index) => {
          Object.entries(item).forEach(([k, v]) => {
            formData.append(`detalles[${index}][${k}]`, String(v));
          });
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    evidencias.forEach((file) => {
      formData.append("evidencias[]", file);
    });

    const res = await api.post<IRespuesta<unknown>>(
      `${path}/transferencias`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return res.data;
  },

  getPersonalExterno: async (): Promise<IRespuesta<RES_PersonalExterno[]>> => {
    const { data } = await api.get(`${path}/aux/personal-externo`);
    return data;
  },

  crearPersonalExterno: async (
    nuevoPersonal: Record<string, unknown>,
  ): Promise<IRespuesta<RES_PersonalExterno>> => {
    const { data } = await api.post(
      `${path}/aux/personal-externo`,
      nuevoPersonal,
    );
    return data;
  },
};
