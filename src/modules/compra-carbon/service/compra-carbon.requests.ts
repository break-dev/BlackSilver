export interface CrearCompraCarbonDetalle {
  id_tipo_carbon: number;
  cantidad: number;
  precio_unitario: number;
}

export interface CrearCompraCarbonRequest {
  id_empresa: number;
  id_proveedor: number;
  porcentaje_igv: number;
  fecha_hora_compra: string;
  detalles: CrearCompraCarbonDetalle[];
}