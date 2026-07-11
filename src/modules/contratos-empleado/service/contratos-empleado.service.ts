import { api } from "../../../service/_api";
import type { IRespuesta } from "../../../shared/interfaces/_response";
import type {
  DTO_CrearContratoEmpleado,
} from "./contratos-empleado.requests";
import type {
  RES_ContratoEmpleado,
  RES_EmpleadoConContrato,
} from "../../../service/responses/contrato-empleado";

interface OpcionCatalogo {
  value: string;
  label: string;
}

/**
 * Construye FormData a partir de un objeto + archivos. Boolean → '1'/'0' (Laravel).
 */
const buildFormData = (
  dto: Record<string, unknown>,
  archivos: File[] = [],
  archivosKey = "evidencias",
): FormData => {
  const formData = new FormData();
  Object.entries(dto).forEach(([key, value]) => {
    if (key === "evidencias") return;
    if (value === null || value === undefined || value === "") return;
    if (value instanceof Date) {
      formData.append(key, value.toISOString().split("T")[0]);
      return;
    }
    if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
      return;
    }
    formData.append(key, value instanceof File ? value : String(value));
  });
  archivos.forEach((file) => formData.append(`${archivosKey}[]`, file));
  return formData;
};

export const ContratosEmpleadoService = {
  get_contratos: async (
    idEmpleado?: number,
    estado?: string,
  ): Promise<IRespuesta<RES_ContratoEmpleado[]>> => {
    const { data } = await api.get("/contratos-empleado", {
      params: { id_empleado: idEmpleado, estado },
    });
    return data;
  },

  get_contrato_by_id: async (
    idContrato: number,
  ): Promise<IRespuesta<RES_ContratoEmpleado>> => {
    const { data } = await api.get(`/contratos-empleado/${idContrato}`);
    return data;
  },

  get_historial_por_empleado: async (
    idEmpleado: number,
  ): Promise<IRespuesta<RES_ContratoEmpleado[]>> => {
    const { data } = await api.get(
      `/contratos-empleado/empleado/${idEmpleado}/historial`,
    );
    return data;
  },

  /**
   * Crea un contrato standalone (uso desde el listado de empleados).
   * Devuelve `{ contrato, empleado }` para que el frontend pueda actualizar
   * la fila del empleado sin recargar la lista completa.
   */
  crear_contrato: async (
    dto: DTO_CrearContratoEmpleado,
    evidencias: File[] = [],
  ): Promise<IRespuesta<RES_EmpleadoConContrato>> => {
    const formData = buildFormData(
      dto as unknown as Record<string, unknown>,
      evidencias,
    );
    const { data } = await api.post("/contratos-empleado", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /**
   * Crea el empleado + su contrato en un solo paso (usado por el registro de empleado).
   */
  crear_empleado_con_contrato: async (
    empleado: Record<string, unknown>,
    contrato: Record<string, unknown>,
    fotoEmpleado: File | null,
    evidencias: File[] = [],
  ): Promise<IRespuesta<RES_EmpleadoConContrato>> => {
    const formData = new FormData();

    // Campos a nivel raíz (Laravel los lee como $request->input('empleado.*'))
    Object.entries(empleado).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      if (key === "foto") return; // foto va aparte
      if (value instanceof Date) {
        formData.append(`empleado[${key}]`, value.toISOString().split("T")[0]);
        return;
      }
      if (typeof value === "boolean") {
        formData.append(`empleado[${key}]`, value ? "1" : "0");
        return;
      }
      formData.append(
        `empleado[${key}]`,
        value instanceof File ? value : String(value),
      );
    });

    Object.entries(contrato).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      if (key === "evidencias") return;
      if (value instanceof Date) {
        formData.append(`contrato[${key}]`, value.toISOString().split("T")[0]);
        return;
      }
      if (typeof value === "boolean") {
        formData.append(`contrato[${key}]`, value ? "1" : "0");
        return;
      }
      formData.append(
        `contrato[${key}]`,
        value instanceof File ? value : String(value),
      );
    });

    if (fotoEmpleado) {
      formData.append("empleado[foto]", fotoEmpleado);
    }

    evidencias.forEach((file) => formData.append("contrato[evidencias][]", file));

    const { data } = await api.post("/empleados/con-contrato", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  finalizar_anticipado: async (
    idContrato: number,
    fechaFinAnticipada: string,
  ): Promise<IRespuesta<{ empleado: RES_EmpleadoConContrato["empleado"] }>> => {
    const { data } = await api.post(
      `/contratos-empleado/${idContrato}/finalizar-anticipado`,
      { fecha_fin_anticipada: fechaFinAnticipada },
    );
    return data;
  },

  get_tipos_contrato: async (): Promise<IRespuesta<OpcionCatalogo[]>> => {
    const { data } = await api.get("/aux/tipos-contrato");
    return data;
  },

  get_periodos_duracion: async (): Promise<IRespuesta<OpcionCatalogo[]>> => {
    const { data } = await api.get("/aux/periodos-duracion");
    return data;
  },
};
