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

// Sincronizado con PHP: EstadoSolicitud
export enum EstadoSolicitud {
  Generada = "Generada",
  Cerrada = "Cerrada",
  EnProceso = "En Proceso",
  Anulada = "Anulada",
}


// Sincronizado con PHP: EstadoSolicitudDetalle
export enum EstadoSolicitudDetalle {
  EsperandoAprobacion = "Esperando aprobación",
  Rechazado = "Rechazado",
  Aprobado = "Aprobado",
  EnDespacho = "En despacho",
  NuevaEntrega = "Nueva entrega",
  Completado = "Completado",
  Cerrado = "Cerrado",
  SolicitandoPrestamo = "Solicitando préstamo",
}

// Sincronizado con PHP: EstadoDetallePrestamo
export enum EstadoDetallePrestamo {
  Pendiente = "Pendiente",
  Aprobado = "Aprobado",
  DespachoIniciado = "Despacho iniciado",
  NuevaEntrega = "Nueva entrega",
  Completado = "Completado",
  Rechazado = "Rechazado",
  EnReposicion = "En reposición",
  Cerrado = "Cerrado",
}

export enum EstadoVencimiento {
  NA = "N/A",
  SinFecha = "Sin fecha",
  Vigente = "Vigente",
  PorVencer = "Por vencer",
  Vencido = "Vencido",
}

export enum EstadoCotizacion {
  Generada = "Generada",
  Aprobada = "Aprobada",
  Desestimada = "Desestimada",
}

export enum MetodoPago {
  Contado = "Contado",
  Credito = "Credito",
}
