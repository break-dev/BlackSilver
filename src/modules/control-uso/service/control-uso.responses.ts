export interface RES_ControlUsoLog {
  id_log: number;
  id_activo_fijo: number;
  codigo: string | null;
  correlativo: string;
  producto: string;
  es_auditable?: boolean | number;
  categoria: string;
  control_por_horometro: number;
  control_por_odometro: number;
  fecha_hora_inicio_control: string;
  fecha_hora_fin_control: string | null;
  horometro_inicio: string | number;
  horometro_fin: string | number;
  total_horas: string | number;
  precio_unitario: string | number;
  costo_total: string | number;
  observacion: string | null;
  created_at: string;
}

export interface RES_UltimoHorometro {
  ultimo_horometro: number;
}
