import type { RES_Empresa } from "../../../service/responses/empresa";
import type { RES_Oficina } from "../../../service/responses/oficina";
import type { IArchivo } from "../../../shared/interfaces/archivo";

export interface RES_EmpresaResumen extends RES_Empresa {
  oficinas: RES_Oficina[];
  documentos: IArchivo[];
}
