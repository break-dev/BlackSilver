import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_OCTransRecepcion } from "../../../service/responses/ordenes-compra/orden-compra-transferencia-recepcion";
import type {
  RES_OCTransferencia,
  RES_OCTransferenciaDetalle,
} from "../../../service/responses/ordenes-compra/orden-compra-transferencia";
import type { DTO_RegistrarRecepcionTransferencia } from "./oc-recepcion-transferencias.requests";

const path = "/oc-trans-recepciones";

export const OCTransService = {
  // -------------------------------------------------------
  // Transferencias
  // -------------------------------------------------------

  getTransferencias: async (
    idAlmacen: number,
    mes: number,
    anio: number,
  ): Promise<IRespuesta<RES_OCTransferencia[]>> => {
    const { data } = await api.get(`${path}/transferencias`, {
      params: { id_almacen_destino: idAlmacen, mes, anio },
    });
    return data;
  },

  getDetallesTransferencia: async (
    id: number,
  ): Promise<IRespuesta<RES_OCTransferenciaDetalle[]>> => {
    const { data } = await api.get(`${path}/transferencias/${id}/detalles`);
    return data;
  },

  // -------------------------------------------------------
  // Recepciones
  // -------------------------------------------------------

  getHistorialRecepciones: async (
    idTransferencia: number,
  ): Promise<IRespuesta<RES_OCTransRecepcion[]>> => {
    const { data } = await api.get(`${path}/recepciones/${idTransferencia}`);
    return data;
  },

  registrarRecepcion: async (
    dto: DTO_RegistrarRecepcionTransferencia,
    evidencias: File[],
  ): Promise<IRespuesta<null>> => {
    const formData = new FormData();
    formData.append("id_transferencia", dto.id_transferencia.toString());
    formData.append(
      "id_almacen_recepcionista",
      dto.id_almacen_recepcionista.toString(),
    );
    formData.append("con_incidencia", dto.con_incidencia ? "1" : "0");
    formData.append("observacion", dto.observacion ?? "");
    formData.append("fecha_hora_recepcion", dto.fecha_hora_recepcion ?? "");
    formData.append("items", JSON.stringify(dto.items));

    evidencias.forEach((file) => {
      formData.append("evidencias[]", file);
    });

    const { data } = await api.post(`${path}/recepciones`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
