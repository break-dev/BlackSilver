import { useState, useCallback, useEffect, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ContratosEmpleadoService } from "../service/contratos-empleado.service";
import {
  Schema_CrearContratoEmpleado,
  type DTO_CrearContratoEmpleado,
} from "../service/contratos-empleado.requests";
import type { RES_EmpleadoConContrato } from "../../../service/responses/contrato-empleado";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Area, RES_Cargo } from "../../../service/responses/organigrama";
import type { RES_Labor } from "../../../service/responses/labor";
import type { RES_Empresa } from "../../../service/responses/empresa";
import type { RES_Oficina } from "../../../service/responses/oficina";
import { TipoContrato } from "../../../shared/enums/tipo-contrato";

const TIPOS_CONTRATO_OPTIONS = [
  { value: TipoContrato.Planilla, label: "Planilla" },
  { value: TipoContrato.JornadaDiaria, label: "Jornada Diaria" },
  { value: TipoContrato.PeriodoPrueba, label: "Periodo de Prueba" },
];

const PERIODOS_DURACION = [
  { value: "diario", label: "Días" },
  { value: "mensual", label: "Meses" },
  { value: "anual", label: "Años" },
];

const initialForm = (idEmpleado: number): DTO_CrearContratoEmpleado => ({
  id_empleado: idEmpleado,
  id_cargo: 0,
  id_empresa: 0,
  id_almacen: null,
  id_labor: null,
  id_oficina: null,
  tipo_contrato: TipoContrato.Planilla,
  sueldo_base: null,
  sueldo_real: null,
  salario_diario: null,
  fecha_inicio: (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })(),
  fecha_fin: "",
  por_tiempo_indefinido: false,
  duracion: null,
  periodo_duracion: null,
  observaciones: null,
  fecha_fin_anticipada: null,
  evidencias: null,
});

/**
 * Calcula la duración en días entre dos fechas YYYY-MM-DD.
 * Devuelve null si alguna fecha no es válida o si inicio >= fin.
 */
const calcDuracionDias = (inicio: string, fin: string): number | null => {
  if (!inicio || !fin) return null;
  const d1 = new Date(inicio);
  const d2 = new Date(fin);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;
  const diff = d2.getTime() - d1.getTime();
  if (diff <= 0) return null;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Dado un número de días, sugiere un periodo (Dias/Meses/Años) y duración humana.
 * Solo es una sugerencia: el usuario puede editar el resultado.
 */
const sugerirPeriodo = (
  dias: number | null,
): { duracion: number; periodo_duracion: "diario" | "mensual" | "anual" } => {
  if (dias === null || dias <= 0) {
    return { duracion: 1, periodo_duracion: "diario" };
  }
  if (dias >= 365) {
    return { duracion: Math.round(dias / 365), periodo_duracion: "anual" };
  }
  if (dias >= 30) {
    return { duracion: Math.round(dias / 30), periodo_duracion: "mensual" };
  }
  return { duracion: dias, periodo_duracion: "diario" };
};

export const useRegistroContratoEmpleado = (
  idEmpleado: number,
  onSuccess?: (payload: RES_EmpleadoConContrato) => void,
) => {
  const { notify } = useNotify();
  const [form, setForm] = useState<DTO_CrearContratoEmpleado>(() =>
    initialForm(idEmpleado),
  );
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<RES_Area[]>([]);
  const [todosCargos, setTodosCargos] = useState<RES_Cargo[]>([]);
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [idArea, setIdArea] = useState<number | null>(null);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [loadingLabores, setLoadingLabores] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [almacenes, setAlmacenes] = useState<
    { id_almacen: number; nombre: string; es_principal: number }[]
  >([]);
  const [labores, setLabores] = useState<RES_Labor[]>([]);

  const [tipoLugar, setTipoLugar] = useState<"" | "almacen" | "labor" | "oficina">("");
  const [oficinas, setOficinas] = useState<RES_Oficina[]>([]);
  const [loadingOficinas, setLoadingOficinas] = useState(false);

  const cargarCatalogos = useCallback(async () => {
    setLoadingAreas(true);
    setLoadingCargos(true);
    setLoadingAlmacenes(true);
    setLoadingLabores(true);
    setLoadingEmpresas(true);
    setLoadingOficinas(true);
    try {
      const [areasRes, cargosRes, almacenesRes, laboresRes, empresasRes, oficinasRes] =
        await Promise.all([
          AuxService.get_areas().catch(() => ({ success: false, data: [] })),
          AuxService.get_cargos().catch(() => ({ success: false, data: [] })),
          AuxService.get_almacenes({ es_principal: false }).catch(() => ({
            success: false,
            data: [],
          })),
          AuxService.get_labores().catch(() => ({ success: false, data: [] })),
          AuxService.get_empresas().catch(() => ({ success: false, data: [] })),
          AuxService.get_oficinas().catch(() => ({ success: false, data: [] })),
        ]);
      if (areasRes.success) setAreas(areasRes.data as RES_Area[]);
      if (cargosRes.success) setTodosCargos(cargosRes.data as RES_Cargo[]);
      if (almacenesRes.success) {
        const data = almacenesRes.data as Array<{
          id_almacen: number;
          nombre: string;
          es_principal: number;
        }>;
        setAlmacenes(data);
      }
      if (laboresRes.success) setLabores(laboresRes.data as RES_Labor[]);
      if (empresasRes.success) setEmpresas(empresasRes.data as RES_Empresa[]);
      if (oficinasRes.success) setOficinas(oficinasRes.data as RES_Oficina[]);
    } finally {
      setLoadingAreas(false);
      setLoadingCargos(false);
      setLoadingAlmacenes(false);
      setLoadingLabores(false);
      setLoadingEmpresas(false);
      setLoadingOficinas(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  // Filtrado de cargos en memoria
  const cargos = useMemo(() => {
    const sinArea = todosCargos.filter((c) => c.id_area === null);
    if (!idArea) return todosCargos;
    const delArea = todosCargos.filter((c) => c.id_area === idArea);
    return [...delArea, ...sinArea];
  }, [todosCargos, idArea]);

  // Cargo agrupado por área para el Select
  const cargosSelectData = useMemo(() => {
    const grouped = new Map<string, { value: string; label: string }[]>();
    cargos.forEach((c) => {
      const area = areas.find((a) => a.id_area === c.id_area);
      const groupName = area ? area.nombre : "Sin área asignada";
      if (!grouped.has(groupName)) grouped.set(groupName, []);
      grouped.get(groupName)!.push({
        value: c.id_cargo.toString(),
        label: c.nombre,
      });
    });
    return Array.from(grouped.entries()).map(([group, items]) => ({
      group,
      items,
    }));
  }, [cargos, areas]);

  // Empresas como opciones para Select
  const empresasSelectData = useMemo(
    () =>
      empresas.map((e) => ({
        value: e.id_empresa.toString(),
        label: e.razon_social,
      })),
    [empresas],
  );

  // Cálculo automático de duracion_dias (read-only)
  const duracionDiasCalc = useMemo(
    () => calcDuracionDias(form.fecha_inicio ?? "", form.fecha_fin ?? ""),
    [form.fecha_inicio, form.fecha_fin],
  );

  const setField = <K extends keyof DTO_CrearContratoEmpleado>(
    field: K,
    value: DTO_CrearContratoEmpleado[K],
  ) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Si cambia el tipo_contrato, limpiar el salario que no corresponde
      if (field === "tipo_contrato") {
        const nuevoTipo = value as string;
        if (nuevoTipo === TipoContrato.JornadaDiaria) {
          next.sueldo_base = null;
          next.sueldo_real = null;
        } else {
          next.salario_diario = null;
        }
      }

      // Si cambia sueldo_base, autocompletar sueldo_real si este aún no se ha modificado manualmente o está vacío
      if (field === "sueldo_base") {
        const nuevoBase = value as number | null;
        next.sueldo_real = nuevoBase;
      }

      // Si cambió fecha_inicio o fecha_fin, autocalcular duracion y periodo_duracion
      if (field === "fecha_inicio" || field === "fecha_fin") {
        const inicio =
          (field === "fecha_inicio" ? (value as string) : prev.fecha_inicio) ??
          "";
        const fin =
          (field === "fecha_fin" ? (value as string) : prev.fecha_fin) ?? "";
        const dias = calcDuracionDias(inicio, fin);
        if (dias !== null) {
          const sug = sugerirPeriodo(dias);
          next.duracion = sug.duracion;
          next.periodo_duracion = sug.periodo_duracion;
        }
      }

      return next;
    });
  };

  const handleSetIdArea = (value: number | null) => {
    setIdArea(value);
    if (value === null) {
      setForm((prev) => ({ ...prev, id_cargo: 0 }));
    }
  };

  /**
   * Cambia el tipo de lugar de trabajo. Garantiza exclusividad:
   * al elegir "almacen" se limpia id_labor (y viceversa).
   */
  const handleSetTipoLugar = (value: "" | "almacen" | "labor" | "oficina") => {
    setTipoLugar(value);
    if (value === "almacen") {
      setForm((prev) => ({ ...prev, id_labor: null, id_oficina: null }));
    } else if (value === "labor") {
      setForm((prev) => ({ ...prev, id_almacen: null, id_oficina: null }));
    } else if (value === "oficina") {
      setForm((prev) => ({ ...prev, id_almacen: null, id_labor: null }));
    } else {
      setForm((prev) => ({ ...prev, id_almacen: null, id_labor: null, id_oficina: null }));
    }
  };

  /**
   * Cambia el id específico del lugar de trabajo según el tipo seleccionado.
   * El frontend lo trata como un solo campo visual, pero internamente
   * sigue usando `id_almacen`, `id_labor` y `id_oficina` por separado.
   */
  const handleSetLugarId = (id: number | null) => {
    if (tipoLugar === "almacen") {
      setField("id_almacen", id);
    } else if (tipoLugar === "labor") {
      setField("id_labor", id);
    } else if (tipoLugar === "oficina") {
      setField("id_oficina", id);
    }
  };

  /** Valor actual del id específico del lugar (según tipo seleccionado). */
  const lugarIdActual = useMemo<number | null>(() => {
    if (tipoLugar === "almacen") {
      return form.id_almacen ?? null;
    }
    if (tipoLugar === "labor") {
      return form.id_labor ?? null;
    }
    if (tipoLugar === "oficina") {
      return form.id_oficina ?? null;
    }
    return null;
  }, [tipoLugar, form.id_almacen, form.id_labor, form.id_oficina]);

  const handleAddEvidencia = (file: File | File[] | null) => {
    if (!file) return;
    const list = Array.isArray(file) ? file : [file];
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    const tooLarge = list.find((f) => f.size > MAX_SIZE);
    if (tooLarge) {
      notify({
        type: "error",
        content: `El archivo "${tooLarge.name}" supera el límite máximo permitido.`,
      });
      return;
    }
    setEvidencias((prev) => [...prev, ...list]);
  };

  const handleRemoveEvidencia = (index: number) => {
    setEvidencias((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearEvidencias = () => setEvidencias([]);

  const handleSubmit = async () => {
    const payloadSanitizado = {
      ...form,
      sueldo_base:
        form.tipo_contrato === TipoContrato.JornadaDiaria
          ? null
          : form.sueldo_base,
      sueldo_real:
        form.tipo_contrato === TipoContrato.JornadaDiaria
          ? null
          : form.sueldo_real !== null && form.sueldo_real !== undefined
            ? form.sueldo_real
            : form.sueldo_base,
      salario_diario:
        form.tipo_contrato === TipoContrato.JornadaDiaria
          ? form.salario_diario
          : null,
    };

    const validation = Schema_CrearContratoEmpleado.safeParse(payloadSanitizado);
    if (!validation.success) {
      notify({ type: "info", content: validation.error.issues[0].message });
      return;
    }

    const totalSize = evidencias.reduce((acc, f) => acc + f.size, 0);
    if (totalSize > 8 * 1024 * 1024) {
      notify({
        type: "error",
        content: "El total de archivos supera el límite máximo permitido.",
      });
      return;
    }

    setLoading(true);
    try {
      const resp = await ContratosEmpleadoService.crear_contrato(
        validation.data,
        evidencias,
      );
      if (resp.success) {
        notify({ type: "success", content: resp.message });
        // El backend devuelve `{ contrato, empleado }`. Pasamos el payload
        // completo para que el padre pueda actualizar la fila del empleado
        // sin recargar toda la lista.
        onSuccess?.(resp.data as RES_EmpleadoConContrato);
        setForm(initialForm(idEmpleado));
        setEvidencias([]);
        setIdArea(null);
        setTipoLugar("");
      } else {
        notify({ type: "error", content: resp.message });
      }
    } catch (err) {
      console.error(err);
      notify({ type: "error", content: "Error inesperado al registrar el contrato" });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setField,
    idArea,
    setIdArea: handleSetIdArea,
    setConContrato: (v: boolean) =>
      setField("por_tiempo_indefinido", v),
    evidencias,
    handleAddEvidencia,
    handleRemoveEvidencia,
    handleClearEvidencias,
    areas,
    setAreas,
    cargos,
    setTodosCargos,
    cargosSelectData,
    empresas,
    empresasSelectData,
    almacenes,
    labores,
    tipoLugar,
    setTipoLugar: handleSetTipoLugar,
    lugarIdActual,
    setLugarId: handleSetLugarId,
    loadingAreas,
    loadingCargos,
    loadingAlmacenes,
    loadingLabores,
    loadingEmpresas,
    loadingOficinas,
    oficinas,
    tiposContratoOptions: TIPOS_CONTRATO_OPTIONS,
    periodosDuracionOptions: PERIODOS_DURACION,
    duracionDiasCalc,
    loading,
    handleSubmit,
    setEvidencias,
  };
};
