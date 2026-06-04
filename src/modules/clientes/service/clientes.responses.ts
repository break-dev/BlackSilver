import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";

export interface ClienteResponse {
  id_cliente: number;
  tipo_entidad: string | null;
  dni: string | null;
  ruc: string | null;
  razon_social: string;
  direccion: string | null;
  telefono: string | null;
  correo: string | null;
  estado: EstadoBase;
  created_at: string;
}
