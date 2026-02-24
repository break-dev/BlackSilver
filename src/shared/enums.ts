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

export enum EstadoRequerimiento {
  Generada = "Generada",
  Pendiente = "Pendiente",
  Aprobado = "Aprobado",
  Atendido = "Atendido",
  Rechazado = "Rechazado",
  Anulado = "Anulado",
}
