export enum EstadoPrestamo {
  Generado = "Generado",
  EnProceso = "En Proceso",
  Completado = "Completado",
  Finalizado = "Finalizado",
  Anulado = "Anulado",
}

export enum EstadoDetallePrestamo {
  Pendiente = "Pendiente",
  Aprobado = "Aprobado",
  DespachoIniciado = "Despacho iniciado",
  NuevaEntrega = "Nueva entrega",
  Completado = "Completado",
  DevolucionParcial = "Devolución parcial",
  DevolucionTotal = "Devolución total",
  Rechazado = "Rechazado",
  Cerrado = "Cerrado",
}

export enum EstadoEntregaPrestamo {
  EnDespacho = "En despacho",
  Confirmada = "Entrega confirmada",
  Anulada = "Anulada",
}
