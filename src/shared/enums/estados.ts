export enum EstadoBase {
  Activo = "Activo",
  Inactivo = "Inactivo",
}

// Sincronizado con PHP: EstadoRequerimiento
export enum EstadoRequerimiento {
  Generado = "Generado",
  Cerrado = "Cerrado",
  EnProceso = "En Proceso",
  Anulado = "Anulado",
}

// Sincronizado con PHP: EstadoDetalleRequerimiento
export enum EstadoDetalleRequerimiento {
  EsperandoAprobacion = "Esperando aprobación",
  Rechazado = "Rechazado",
  Aprobado = "Aprobado",
  ConsultaLogistica = "Consultando a Logística",
  RechazadoLogistica = "Rechazado por Logística",
  AprobadoLogistica = "Aprobado por Logística",
  Completado = "Completado",
  Cerrado = "Cerrado",
  EnDespacho = "En Despacho",
  NuevaEntrega = "Nueva Entrega",
}

export enum EstadoVencimiento {
  NA = "N/A",
  SinFecha = "Sin Fecha",
  Vigente = "Vigente",
  PorVencer = "Por Vencer",
  Vencido = "Vencido",
}