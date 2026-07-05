import { z } from "zod";

export const Schema_AsignarHorario = z
  .object({
    id_turno_laboral: z.number().int().min(1, "Seleccione un turno laboral"),
    fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    por_tiempo_indefinido: z.boolean().optional().default(false),
    fecha_fin: z
      .string()
      .nullable()
      .optional()
      .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
    dias_laborables: z
      .string()
      .length(7, "Debe seleccionar 7 días")
      .regex(/^[01]{7}$/, "Patrón de días inválido"),
    empleados: z
      .array(z.number().int().min(1))
      .min(1, "Seleccione al menos un empleado"),
  })
  .superRefine((data, ctx) => {
    if (!data.por_tiempo_indefinido) {
      if (!data.fecha_fin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fecha_fin"],
          message: "Indique la fecha de fin",
        });
      } else if (data.fecha_fin < data.fecha_inicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fecha_fin"],
          message: "La fecha de fin debe ser posterior o igual al inicio",
        });
      }
    }

    const seleccionados = data.dias_laborables.split("").filter((c) => c === "1").length;
    if (seleccionados === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dias_laborables"],
        message: "Debe marcar al menos un día laborable",
      });
    }
  });

export type DTO_AsignarHorario = z.infer<typeof Schema_AsignarHorario>;

export const Schema_CambiarEstadoProgramacion = z.object({
  estado: z.enum(["Activo", "Inactivo"]),
});

export type DTO_CambiarEstadoProgramacion = z.infer<typeof Schema_CambiarEstadoProgramacion>;

export const Schema_EmpleadoElegible = z.object({
  fecha_fin_programacion: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v === "" || v === null || v === undefined ? null : v)),
});

export type DTO_EmpleadoElegible = z.infer<typeof Schema_EmpleadoElegible>;