export enum EstadoBase {
  Activo = "Activo",
  Inactivo = "Inactivo",
}

// Sincronizado con PHP: EstadoRequerimiento
export enum EstadoRequerimiento {
  Generada = "Generada",
  Cerrada = "Cerrada",
  Anulada = "Anulada",
}

// Sincronizado con PHP: EstadoDetalleRequerimiento
export enum EstadoDetalleRequerimiento {
  Pendiente = "Pendiente",
  AprobacionLogistica = "Aprobación - Logística",
  DespachoIniciado = "Despacho iniciado",
  NuevaEntrega = "Nueva entrega",
  RechazadoLogistica = "Rechazado - Logística",
  Completado = "Completado",
  Cerrado = "Cerrado",
}
