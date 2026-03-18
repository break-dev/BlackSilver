import { api } from "../../../service/api";
import type { IRespuesta } from "../../../shared/interfaces";
import type { DTO_RegistroCategoria } from "./categorias.requests";
import type { RES_Categoria } from "./categorias.responses";

export class CategoriasService {
  private static PATH = "/categorias";

  public static get_categorias = async (): Promise<
    IRespuesta<RES_Categoria[]>
  > => {
    const { data } = await api.get(`${this.PATH}`);
    return data;
  };

  public static crear_categoria = async (
    dto: DTO_RegistroCategoria,
  ): Promise<IRespuesta<RES_Categoria>> => {
    const { data } = await api.post(`${this.PATH}`, dto);
    return data;
  };

  public static actualizar_consumidoras = async (
    id_categoria: number,
    ids_consumidoras: number[],
  ): Promise<IRespuesta<RES_Categoria>> => {
    const { data } = await api.post(`${this.PATH}/actualizar-consumidoras`, {
      id_categoria,
      ids_consumidoras,
    });
    return data;
  };
}
