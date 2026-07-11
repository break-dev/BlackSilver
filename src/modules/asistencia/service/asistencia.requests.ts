import { z } from "zod";

/**
 * Filtros para el listado admin de Asistencia.
 *
 * Mes + Año son obligatorios para mantener paridad con el patrón de Kardex
 * (listado mensual). El resto son opcionales y se acumulan.
 */
export const Schema_FiltrosAsistencia = z.object({
  mes: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
  year: z
    .union([z.string(), z.number()])
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
  id_empleado: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : Number(v))),
  id_almacen: z.number().int().min(1).nullable().optional(),
  id_labor: z.number().int().min(1).nullable().optional(),
  id_lugar: z.number().int().min(1).nullable().optional(),
  tipo_lugar: z.enum(["almacen", "labor"]).nullable().optional(),
  q: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
});

export type DTO_FiltrosAsistencia = z.infer<typeof Schema_FiltrosAsistencia>;

/**
 * Body para registrar un marcaje manual desde el panel admin.
 */
export const Schema_MarcajeManual = z.object({
  id_empleado: z.number().int().min(1),
  fecha_hora: z.string().min(1),
  tipo_marcaje: z.enum(["Ingreso", "Salida"]),
  id_programacion_horario: z.number().int().min(1).nullable().optional(),
  observaciones: z
    .string()
    .max(500)
    .nullable()
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
});

export type DTO_MarcajeManual = z.infer<typeof Schema_MarcajeManual>;

/**
 * Body del flujo /marcar-asistencia → resolver-qr.
 */
export const Schema_ResolverQR = z.object({
  qr_token: z.string().min(8).max(255),
  evidencia_inicial: z
    .object({
      url: z.string(),
      path_relativo: z.string(),
      nombre_original: z.string().nullable().optional(),
      extension: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type DTO_ResolverQR = z.infer<typeof Schema_ResolverQR>;

export const Schema_Archivo = z.object({
  url: z.string(),
  path_relativo: z.string(),
  nombre_original: z.string().nullable().optional(),
  extension: z.string().nullable().optional(),
});

/**
 * Body del flujo /marcar-asistencia → confirmar-asistencia.
 *
 * El backend CREA el marcaje al recibir este request (proceso_confirmado=true)
 * y crea/actualiza la asistencia del día. El `id_sesion` correlaciona con
 * el session_id devuelto por `resolver_qr` (puede omitirse, es solo trazabilidad).
 */
export const Schema_ConfirmarAsistencia = z.object({
  id_sesion: z.string().max(64).optional(),
  id_empleado: z.number().int().min(1),
  evidencia_rostro: Schema_Archivo.nullable().optional(),
  evidencia_qr: Schema_Archivo.nullable().optional(),
});

export type DTO_ConfirmarAsistencia = z.infer<typeof Schema_ConfirmarAsistencia>;

/**
 * Body del flujo /marcar-asistencia → cancelar-proceso.
 *
 * El backend CREA un marcaje con `proceso_confirmado=false` para registrar
 * el intento incompleto. `llego_al_qr` indica si el usuario llegó al menos
 * al paso 2 antes de cancelar (true) o si cerró antes de escanear (false).
 */
export const Schema_CancelarProceso = z.object({
  id_empleado: z.number().int().min(1),
  llego_al_qr: z.boolean().optional(),
  id_sesion: z.string().max(64).optional(),
  motivo: z.string().max(255).nullable().optional(),
  evidencia_qr: Schema_Archivo.nullable().optional(),
});

export type DTO_CancelarProceso = z.infer<typeof Schema_CancelarProceso>;