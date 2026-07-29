import { z } from "zod";

const fechaTransform = (val: unknown) => {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split("T")[0];
  return val as string;
};

// Para numéricos opcionales: si llega "" -> null; si es number -> number.
const numberTransform = (val: unknown) => {
  if (val === "" || val === null || val === undefined) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

/**
 * Schema para crear un contrato de trabajo.
 *
 * Reglas:
 *  - Si tipo_contrato === "Planilla": sueldo_base requerido, salario_diario debe ser NULL.
 *  - Si tipo_contrato === "JornadaDiaria": salario_diario requerido, sueldo_base debe ser NULL.
 *  - Si por_tiempo_indefinido === true: duracion, periodo_duracion opcionales.
 *  - Si por_tiempo_indefinido === false: duracion y periodo_duracion obligatorios.
 *  - Al menos uno de id_almacen o id_labor requerido (lugar de trabajo).
 */
export const Schema_CrearContratoEmpleado = z
  .object({
    id_empleado: z.number().min(1, "Empleado requerido"),
    id_cargo: z.number().nullable().optional(),
    id_empresa: z.number().min(1, "Debe seleccionar una empresa"),
    id_almacen: z.number().nullable().optional(),
    id_labor: z.number().nullable().optional(),
    id_oficina: z.number().nullable().optional(),
    tipo_contrato: z.enum(["Planilla", "JornadaDiaria", "PeriodoPrueba"]),
    sueldo_base: z
      .number()
      .nullable()
      .optional()
      .transform(numberTransform),
    salario_diario: z
      .number()
      .nullable()
      .optional()
      .transform(numberTransform),
    fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
    fecha_fin: z.string().nullable().optional(),
    por_tiempo_indefinido: z.boolean().optional().default(false),
    duracion: z
      .number()
      .nullable()
      .optional()
      .transform(numberTransform),
    periodo_duracion: z
      .enum(["diario", "semanal", "mensual", "anual"])
      .nullable()
      .optional(),
    observaciones: z.string().max(500).optional().nullable(),
    fecha_fin_anticipada: z.string().nullable().optional().transform(fechaTransform),
    evidencias: z.any().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const esPlanilla = data.tipo_contrato === "Planilla";
    const esPeriodoPrueba = data.tipo_contrato === "PeriodoPrueba";
    const esJornada = data.tipo_contrato === "JornadaDiaria";
    const exigeSueldoMensual = esPlanilla || esPeriodoPrueba;

    if (exigeSueldoMensual && (data.sueldo_base === null || data.sueldo_base === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sueldo_base"],
        message: esPeriodoPrueba
          ? "Debe especificar el sueldo mensual para Periodo de Prueba"
          : "Debe especificar el sueldo base para Planilla",
      });
    }

    if (esJornada && (data.salario_diario === null || data.salario_diario === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salario_diario"],
        message: "Debe especificar el salario diario para Jornada Diaria",
      });
    }

    // Exclusividad sueldo_base vs salario_diario
    if (exigeSueldoMensual && data.salario_diario !== null && data.salario_diario !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salario_diario"],
        message: "Para este tipo de contrato, salario_diario debe ser vacío",
      });
    }
    if (esJornada && data.sueldo_base !== null && data.sueldo_base !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sueldo_base"],
        message: "Para Jornada Diaria, sueldo_base debe ser vacío",
      });
    }

    // Duración solo si NO es indefinido
    if (!data.por_tiempo_indefinido) {
      const durVal = typeof data.duracion === "string" ? Number(data.duracion) : data.duracion;
      if (!durVal || Number(durVal) < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["duracion"],
          message: "Indique la duración del contrato",
        });
      }
      if (!data.periodo_duracion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["periodo_duracion"],
          message: "Indique el periodo de la duración",
        });
      }
    }

    // Si hay fecha_fin y fecha_inicio, validar orden cronológico
    if (
      data.fecha_fin &&
      data.fecha_inicio &&
      data.fecha_fin < data.fecha_inicio
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fecha_fin"],
        message: "La fecha de fin no puede ser menor a la fecha de inicio",
      });
    }

    // Al menos uno: id_almacen, id_labor o id_oficina (exactamente uno, validado en backend)
    const almVal = typeof data.id_almacen === "string" ? Number(data.id_almacen) : data.id_almacen;
    const labVal = typeof data.id_labor === "string" ? Number(data.id_labor) : data.id_labor;
    const ofVal = typeof data.id_oficina === "string" ? Number(data.id_oficina) : data.id_oficina;
    const sinAlmacen = almVal === null || almVal === undefined || Number(almVal) === 0;
    const sinLabor = labVal === null || labVal === undefined || Number(labVal) === 0;
    const sinOficina = ofVal === null || ofVal === undefined || Number(ofVal) === 0;
    if (sinAlmacen && sinLabor && sinOficina) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id_almacen"],
        message: "Seleccione al menos un almacén, labor u oficina",
      });
    }
  });

export type DTO_CrearContratoEmpleado = z.infer<
  typeof Schema_CrearContratoEmpleado
>;
