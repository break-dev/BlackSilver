import { api } from "../../../service/_api";
import type { RES_UnidadMedida } from "../../../service/responses/unidad-medida";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { DTO_CrearProducto } from "./productos.requests";
import type { RES_Producto, RES_CategoriaBien } from "./productos.responses";

export class ProductosService {
  private static PATH = "/productos";

  public static get_productos = async (): Promise<
    IRespuesta<RES_Producto[]>
  > => {
    const { data } = await api.get(this.PATH);
    return data;
  };

  public static get_categorias = async (): Promise<
    IRespuesta<RES_CategoriaBien[]>
  > => {
    const { data } = await api.get(`${this.PATH}/aux/categorias`);
    return data;
  };

  public static get_unidades_medida = async (): Promise<
    IRespuesta<RES_UnidadMedida[]>
  > => {
    const { data } = await api.get(`${this.PATH}/aux/unidades-medida`);
    return data;
  };

  public static crear_producto = async (
    dto: DTO_CrearProducto,
  ): Promise<IRespuesta<RES_Producto>> => {
    const { data } = await api.post(this.PATH, dto);
    return data;
  };
}
