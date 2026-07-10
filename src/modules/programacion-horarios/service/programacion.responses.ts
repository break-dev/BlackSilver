import type { EstadoBase } from "../../../shared/enums/_generic/estado-base";
import type { TipoTurno } from "./tipo-turno";

export interface RES_ProgramacionHorario {
  id: number;
  id_empleado: number;
  empleado?: string;
  empleado_url_foto?: string | null;
  id_contrato_trabajo: number;
  tipo_contrato?: string;
  contrato_fecha_inicio?: string | null;
  contrato_fecha_fin?: string | null;
  contrato_indefinido?: boolean;
  id_turno_laboral: number;
  tipo_turno?: TipoTurno | string;
  hora_ingreso?: string;
  hora_salida?: string;
  minutos_tolerancia?: number | null;
  id_oficina: number | null;
  id_almacen: number | null;
  id_labor: number | null;
  almacen_nombre?: string | null;
  labor_nombre?: string | null;
  oficina_nombre?: string | null;
  fecha_inicio: string;
  por_tiempo_indefinido: boolean;
  fecha_fin: string | null;
  dias_laborables: string;
  estado: EstadoBase | string;
}

export interface RES_ProgramacionAsignada {
  programaciones: RES_ProgramacionHorario[];
  rechazados: Array<{
    id_empleado: number;
    motivo: string;
  }>;
  total_creados: number;
  total_rechazados: number;
}

export interface RES_EmpleadoElegible {
  id_empleado: number;
  nombre_completo: string;
  dni?: string;
  url_foto?: string;
  con_contrato: boolean;
  id_contrato_vigente: number | null;
  id_cargo: number | null;
  contrato_estado?: string | null;
  contrato_indefinido?: boolean;
  contrato_fecha_fin?: string | null;
  puede_cubrir: boolean;
  matchea_lugar?: boolean;
}