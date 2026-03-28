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
  EntregaCompleta = "Entrega completa",
  Rechazado = "Rechazado",
  EnReposicion = "En reposición",
  Cerrado = "Cerrado",
}

export enum EstadoEntregaPrestamo {
  EnDespacho = "En despacho",
  Confirmada = "Entrega confirmada",
  Anulada = "Anulada",
}

export enum EstadoReposicion {
  EnDespacho = "En Despacho",
  Recepcionado = "Recepcionado",
}

export enum EstadoDetalleReposicion {
  EnDespacho = "En Despacho",
  Recepcionado = "Recepcionado",
}
