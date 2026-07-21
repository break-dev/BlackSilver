import type { RES_Oficina } from "./oficina";

export interface RES_Empresa {
  id_empresa: number;
  ruc: string;
  razon_social: string;
  url_logo: string | null;
  oficinas: RES_Oficina[];
}
