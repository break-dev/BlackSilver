import type { TipoContrato } from "../../../shared/enums/tipo-contrato";

/**
 * Fila de asistencia agrupada para planilla.
 *
 * Una fila por (empleado, fecha). El backend devuelve snapshots de la
 * programación del día en `programacion_*`, y los valores efectivos (con
 * fallback) en `tipo_contrato`, `sueldo_base`, `salario_diario`.
 */
export interface RES_PlanillaAsistencia {
  id: number;
  id_empleado: number;
  id_programacion_horario: number | null;
  fecha_hora_ingreso: string | null;
  fecha_hora_salida: string | null;
  total_horas: number | null;
  jornada_trabajada: number | null;
  minutos_tardanza: number | null;
  asistencia_es_manual: boolean;
  asistencia_created_at: string;

  // Datos del empleado
  nombre: string;
  apellido: string;
  dni: string | null;
  url_foto: string | null;
  es_contratista: boolean | number;
  id_contrato_vigente: number | null;
  cargo_nombre?: string | null;
  area_nombre?: string | null;
  mina_nombre?: string | null;

  // Snapshot de la programación del día (FUENTE para cálculo).
  programacion_tipo_contrato?: TipoContrato | string | null;
  programacion_sueldo_base?: number | null;
  programacion_sueldo_real?: number | null;
  programacion_sueldo_diario?: number | null;

  // Datos efectivos usados para el cálculo.
  tipo_contrato: TipoContrato | string | null;
  sueldo_base: number | null;
  sueldo_real?: number | null;
  salario_diario: number | null;

  // Datos del contrato (referencial).
  contrato_indefinido: boolean;
  contrato_fecha_inicio: string | null;
  contrato_fecha_fin: string | null;

  // Datos del turno (si la asistencia está vinculada a una programación)
  tipo_turno: string | null;
  hora_ingreso: string | null;
  hora_salida: string | null;
  minutos_tolerancia: number | null;
  turno_total_horas: number | null;

  // Lugar de la programación (soporta almacen | labor | oficina)
  lugar_nombre: string | null;
  lugar_id: number | null;
  lugar_tipo: "almacen" | "labor" | "oficina" | null;

  // Fecha derivada
  fecha: string;
  dia_semana: string;

  // Pago calculado por el backend
  pago_dia: number;

  // Desglose por turno/programación (útil cuando el día tiene varios sueldos).
  tramos_pago?: PlanillaTramoAsistencia[];

  // Marcaciones del día
  marcajes: RES_PlanillaMarcaje[];
}

/**
 * Tramo de pago individualizado por turno/programación dentro de una asistencia.
 * El backend lo devuelve cuando hay varias programaciones en el mismo día con
 * sueldos distintos; cuando todos los turnos comparten el mismo sueldo, devuelve
 * un único tramo con el pago sumado.
 */
export interface PlanillaTramoAsistencia {
  id_programacion_horario: number;
  turno_id: number;
  horas_trabajadas: number;
  horas_programadas: number;
  jornada_trabajada: number;
  pago: number;
  tipo_contrato: string | null;
  sueldo_base: number | null;
  sueldo_diario: number | null;
}

/**
 * Marcaje asociado a una asistencia de planilla.
 */
export interface RES_PlanillaMarcaje {
  id: number;
  id_asistencia: number | null;
  id_empleado: number | null;
  id_programacion_horario: number | null;
  id_empleado_registro: number | null;
  tipo_marcaje: "Ingreso" | "Salida" | null;
  fecha_hora: string;
  evidencias: unknown[] | null;
  es_manual: boolean;
  qr_leido: boolean;
  proceso_confirmado: boolean;
  created_at: string;
}

/**
 * Resumen de planilla por empleado.
 */
export interface RES_PlanillaEmpleado {
  id_empleado: number;
  empleado: string;
  dni: string | null;
  url_foto: string | null;
  tipo_contrato: TipoContrato | string | null;
  sueldo_base: number | null;
  salario_diario: number | null;
  dias_trabajados: number;
  jornada_total: number;
  pago_total: number;
}
