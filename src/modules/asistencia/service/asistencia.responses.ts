import type { TipoContrato } from "../../../shared/enums/tipo-contrato";

/**
 * Fila de asistencia agrupada (modo "Empleados" del admin).
 *
 * Una fila por (empleado, fecha). Incluye los snapshots de la programación
 * (tipo_contrato, sueldo_base, sueldo_diario) que aplican ESE día
 * — NO el contrato vigente actual. Esto permite ver correctamente cambios
 * de sueldo a mitad de mes.
 */
export interface RES_Asistencia {
  id: number;
  id_asistencia?: number;
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

  // Snapshot de la programación del día (FUENTE para cálculo de pago).
  programacion_tipo_contrato?: TipoContrato | string | null;
  programacion_sueldo_base?: number | null;
  programacion_sueldo_real?: number | null;
  programacion_sueldo_diario?: number | null;

  // Datos efectivos usados para el cálculo (snapshot con fallback al contrato).
  tipo_contrato: TipoContrato | string | null;
  sueldo_base: number | null;
  sueldo_real?: number | null;
  salario_diario: number | null;

  // Datos del contrato (referencial, no para cálculo).
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
  marcajes: RES_Marcaje[];
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
  lugar_nombre?: string | null;
  ancla_fecha?: string | null;
  horas_trabajadas: number;
  horas_programadas: number;
  jornada_trabajada: number;
  pago: number;
  tipo_contrato: string | null;
  sueldo_base: number | null;
  sueldo_diario: number | null;
}

/**
 * Marcaje asociado a una asistencia (o huérfano si proceso_confirmado=false).
 */
export interface RES_Marcaje {
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
 * Resumen de planilla por empleado (resultado de /calcular-planilla).
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

/**
 * Filtros de consulta del listado admin.
 */
export interface RES_FiltrosAsistencia {
  mes?: number | string | null;
  year?: number | string | null;
  id_empleado?: number | null;
  id_almacen?: number | null;
  id_labor?: number | null;
  id_lugar?: number | null;
  tipo_lugar?: "almacen" | "labor" | null;
  q?: string | null;
}

/**
 * Respuesta del endpoint POST /asistencia-public/resolver-qr.
 */
export interface RES_ResolverQR {
  id_sesion: string;
  siguiente_tipo_marcaje: "Ingreso" | "Salida";
  ultimo_marcaje_hoy: "Ingreso" | "Salida" | null;
  /**
   * true si la hora actual cae fuera de la ventana extendida del turno más
   * cercano (con tolerancia). El frontend muestra una advertencia.
   */
  fuera_de_tolerancia: boolean;
  empleado: {
    id_empleado: number;
    nombre: string;
    apellido: string;
    nombre_completo: string;
    dni: string | null;
    url_foto: string | null;
  };
  programacion_vigente: {
    id_programacion_horario: number;
    lugar_nombre: string | null;
    turno: {
      id: number;
      tipo_turno: string;
      hora_ingreso: string;
      hora_salida: string;
      minutos_tolerancia: number;
      total_horas: number | null;
    };
  } | null;
  evidencia_inicial?: {
    url: string;
    path_relativo: string;
    nombre_original?: string | null;
    extension?: string | null;
  } | null;
}

/**
 * Respuesta del endpoint POST /asistencia-public/confirmar-asistencia.
 */
export interface RES_ConfirmarAsistencia {
  id_asistencia: number;
  id_marcaje: number;
  tipo_marcaje: "Ingreso" | "Salida";
  minutos_tardanza: number;
  total_horas: number | null;
  jornada_trabajada: number;
  fecha: string;
}

/**
 * Log de intento fallido anónimo.
 */
export interface RES_IntentoFallidoAnonimo {
  id: number;
  id_empleado: number | null;
  id_programacion_horario: number | null;
  fecha_hora: string;
  tipo_marcaje: string | null;
  proceso_confirmado: boolean;
  qr_leido: boolean;
  evidencias: string | null;
  qr_token: string | null;
}