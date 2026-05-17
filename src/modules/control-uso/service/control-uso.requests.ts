export interface REQ_RegistrarUso {
  id_activo_fijo: number;
  fecha_hora_inicio_control: string;
  fecha_hora_fin_control?: string | null;
  horometro_inicio: number;
  horometro_fin: number;
  precio_unitario?: number;
  observacion?: string | null;
}
