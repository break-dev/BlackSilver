import type { RES_TicketLote } from "../../../service/responses/lote-producto";
import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { DTO_AjustarStock, DTO_CrearLote } from "./lotes.requests";
import type {
  RES_Lote,
  RES_ProductoDisponible,
  RES_UnidadMedida,
  RES_Almacen,
} from "./lotes.responses";
import dayjs from "dayjs";

export class LotesService {
  private static PATH = "/lotes-productos";

  /**
   * Obtener almacenes (para el filtro y creación).
   */
  static async listarAlmacenes() {
    const response = await api.get<IRespuesta<RES_Almacen[]>>(
      `${this.PATH}/aux/almacenes`,
    );
    return response.data;
  }

  /**
   * Obtener resumen de lotes por almacén.
   */
  static async listarResumenLotes(idAlmacen: number) {
    const response = await api.get<IRespuesta<RES_Lote[]>>(`/lotes-productos`, {
      params: { id_almacen: idAlmacen },
    });
    return response.data;
  }

  /**
   * Crear nuevo lote.
   */
  static async crear(dto: DTO_CrearLote) {
    // Formatear fechas para el backend
    const payload = {
      ...dto,
      fecha_hora_ingreso: dayjs(dto.fecha_hora_ingreso).format(
        "YYYY-MM-DD HH:mm:ss",
      ),
      fecha_vencimiento: dto.fecha_vencimiento
        ? dayjs(dto.fecha_vencimiento).format("YYYY-MM-DD")
        : null,
    };

    const response = await api.post<IRespuesta<RES_Lote>>(
      `${this.PATH}`,
      payload,
    );
    return response.data;
  }

  /**
   * Listar productos aptos para inventario.
   */
  static async listarProductos() {
    const response = await api.get<IRespuesta<RES_ProductoDisponible[]>>(
      `${this.PATH}/aux/productos`,
    );
    return response.data;
  }

  /**
   * Listar unidades de medida base.
   */
  static async listarUnidades() {
    const response = await api.get<IRespuesta<RES_UnidadMedida[]>>(
      `${this.PATH}/aux/unidades`,
    );
    return response.data;
  }

  /**
   * Ajustar stock de un lote.
   */
  static async ajustarStock(dto: DTO_AjustarStock) {
    const response = await api.post<IRespuesta<RES_Lote>>(
      `${this.PATH}/ajustar-stock`,
      dto,
    );
    return response.data;
  }

  /**
   * Obtener información de lotes para impresión de tickets.
   */
  static async getTicketsInfo(ids: number[]) {
    const response = await api.get<IRespuesta<RES_TicketLote[]>>(
      `${this.PATH}/tickets`,
      {
        params: { ids: ids.join(",") },
      },
    );
    return response.data;
  }
}
