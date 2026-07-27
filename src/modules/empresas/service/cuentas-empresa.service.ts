import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type { RES_CuentaEmpresa } from "../../../service/responses/cuenta-empresa";
import type { DTO_EditarCuenta } from "./cuentas-empresa.requests";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export class CuentasEmpresaService {
  private static PATH = "/empresas/cuentas-empresa";

  public static actualizar_cuenta = async (
    id_cuenta_bancaria: number,
    payload: DTO_EditarCuenta,
  ): Promise<IRespuesta<RES_CuentaEmpresa>> => {
    const { data } = await api.put<IRespuesta<RES_CuentaEmpresa>>(
      `${this.PATH}/${id_cuenta_bancaria}`,
      {
        id_banco: payload.id_banco,
        moneda: payload.moneda,
        numero_cuenta: payload.numero_cuenta,
        cci: payload.cci || null,
        es_para_detraccion: payload.es_para_detraccion,
      },
    );
    return data;
  };

  public static cambiar_estado = async (
    id_cuenta_bancaria: number,
    estado: EstadoBase,
  ): Promise<IRespuesta<null>> => {
    const { data } = await api.patch<IRespuesta<null>>(
      `${this.PATH}/${id_cuenta_bancaria}/estado`,
      { estado },
    );
    return data;
  };
}