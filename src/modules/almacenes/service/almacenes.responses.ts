import { EstadoBase } from "../../../shared/enums/_generic/estado-base";

// Un almacen
export interface RES_AlmacenResumen {
  id_almacen: number;
  nombre: string;
  descripcion?: string;
  es_principal: boolean;
  estado: EstadoBase;
  responsables?: string; // nombres completos separados por coma
  minas_count?: number;
}

// Responsable de un almacen
export interface RES_ResponsableAlmacen {
  id_responsable_almacen: number;
  id_empleado: number;
  nombre_completo: string;
  dni?: string;
  url_foto?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  estado: EstadoBase;
}

// Mina abastecida por un almacen
export interface RES_MinaAbastecida {
  id_almacen_mina: number;
  nombre: string;
  concesion: string;
}

// Posible mina para ser abastecida por un almacen
export interface RES_MinaDisponible {
  id_mina: number;
  nombre: string;
  concesion: string;
}
