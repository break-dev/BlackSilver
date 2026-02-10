import type {
  EstadoBase,
  TipoLabor,
  TipoSostenimiento,
} from "../../../../shared/enums";

export interface RES_Labor {
  id_labor: number;
  id_concesion: number;
  concesion: string;
  nombre: string;
  descripcion: string;
  tipo_labor: TipoLabor;
  tipo_sostenimiento: TipoSostenimiento;
  estado: EstadoBase;
}
