export interface RES_ActivoFijoResumen {
  id_activo: number;
  //
  id_producto: number;
  producto: string;
  es_auditable: boolean;
  //
  id_categoria: number;
  categoria: string;
  para_transporte: boolean;
  control_por_odometro: boolean;
  control_por_horometro: boolean;
  //
  id_marca: number | null;
  marca: string | null;
  //
  id_mina: number | null;
  mina: string | null;
  //
  id_almacen: number | null;
  almacen: string | null;
  en_almacen_principal: boolean | null;
  //
  codigo: string | null;
  correlativo: string;
  numero_serie: string | null;
  modelo: string | null;
  yearcito_modelo: number | null;
  descripcion: string | null;
  especificaciones: { clave: string; valor: string }[] | null;
  //
  fecha_hora_ingreso: string;
  created_at: string;
  estado: string;
}
