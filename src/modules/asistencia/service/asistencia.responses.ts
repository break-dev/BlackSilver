import type { TipoContrato } from "../../../shared/enums/tipo-contrato";

/**
 * Fila de asistencia agrupada (modo "Empleados" del admin).
 *
 * Una fila por (empleado, fecha). Incluye el contrato vigente del empleado
 * al inicio del período y todas sus marcaciones del día.
 */
export interface RES_Asistencia {
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

  // Datos del contrato vigente al inicio del período
  tipo_contrato: TipoContrato | string | null;
  sueldo_base: number | null;
  salario_diario: number | null;
  contrato_indefinido: boolean;
  contrato_fecha_inicio: string | null;
  contrato_fecha_fin: string | null;

  // Datos del turno (si la asistencia está vinculada a una programación)
  tipo_turno: string | null;
  hora_ingreso: string | null;
  hora_salida: string | null;
  minutos_tolerancia: number | null;
  turno_total_horas: number | null;

  // Lugar de la programación
  lugar_nombre: string | null;
  lugar_id: number | null;
  lugar_tipo: "almacen" | "labor" | null;

  // Fecha derivada
  fecha: string;
  dia_semana: string;

  // Pago calculado por el backend
  pago_dia: number;

  // Marcaciones del día
  marcajes: RES_Marcaje[];
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