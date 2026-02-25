export enum EstadoBase {
  Activo = "Activo",
  Inactivo = "Inactivo",
}

export enum TipoLabor {
  Bypass = "Bypass",
  Crucero = "Crucero",
  Tajo = "Tajo",
  Rampa = "Rampa",
  Chimenea = "Chimenea",
}

export enum TipoSostenimiento {
  Convencional = "Convencional",
  Mecanizada = "Mecanizada",
}

export enum TipoRequerimiento {
  Bien = "Bien",
  Servicio = "Servicio",
}

export enum TipoBien {
  Suministro = "Suministro",
  Materiales = "Materiales",
  ActivoFijo = "Activo Fijo",
}

export enum Premura {
  Normal = "Normal",
  Urgente = "Urgente",
  Emergencia = "Emergencia",
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
