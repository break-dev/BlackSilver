import { useState, useCallback, useEffect, useMemo } from "react";
import { useNotify } from "../../../hooks/useNotify";
import { ContratosEmpleadoService } from "../service/contratos-empleado.service";
import {
  Schema_CrearContratoEmpleado,
  type DTO_CrearContratoEmpleado,
} from "../service/contratos-empleado.requests";
import type { RES_ContratoEmpleado } from "../../../service/responses/contrato-empleado";
import { AuxService } from "../../../service/auxiliar.service";
import type { RES_Area, RES_Cargo } from "../../../service/responses/organigrama";
import type { RES_Mina } from "../../../service/responses/mina";
import type { RES_Labor } from "../../../service/responses/labor";
import type { RES_Empresa } from "../../../service/responses/empresa";
import { TipoContrato } from "../../../shared/enums/tipo-contrato";

const TIPOS_CONTRATO_OPTIONS = [
  { value: TipoContrato.Planilla, label: "Planilla" },
  { value: TipoContrato.JornadaDiaria, label: "Jornada Diaria" },
];

const PERIODOS_DURACION = [
  { value: "diario", label: "Días" },
  { value: "mensual", label: "Meses" },
  { value: "anual", label: "Años" },
];

const initialForm = (idEmpleado: number): DTO_CrearContratoEmpleado => ({
  id_empleado: idEmpleado,
  id_cargo: 0,
  id_empresa: null,
  id_almacen: null,
  id_labor: null,
  id_oficina: null,
  tipo_contrato: TipoContrato.Planilla,
  sueldo_base: null,
  salario_diario: null,
  // Por defecto, fecha de inicio = hoy (YYYY-MM-DD).
  fecha_inicio: new Date().toISOString().split("T")[0],
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
  onSuccess?: (contrato: RES_ContratoEmpleado) => void,
) => {
  const { notify } = useNotify();
  const [form, setForm] = useState<DTO_CrearContratoEmpleado>(() =>
    initialForm(idEmpleado),
  );
  const [evidencias, setEvidencias] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<RES_Area[]>([]);
  const [todosCargos, setTodosCargos] = useState<RES_Cargo[]>([]);
  const [minas, setMinas] = useState<RES_Mina[]>([]);
  const [empresas, setEmpresas] = useState<RES_Empresa[]>([]);
  const [idArea, setIdArea] = useState<number | null>(null);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState(false);
  const [loadingMinas, setLoadingMinas] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [almacenes, setAlmacenes] = useState<
    { id_almacen: number; nombre: string; es_principal: number }[]
  >([]);
  const [labores, setLabores] = useState<RES_Labor[]>([]);

  // id_mina local (no parte del DTO del schema: es solo trigger para cargar labores)
  const [idMinaLocal, setIdMinaLocal] = useState<number | null>(null);

  const cargarCatalogos = useCallback(async () => {
    setLoadingAreas(true);
    setLoadingCargos(true);
    setLoadingMinas(true);
    setLoadingAlmacenes(true);
    setLoadingEmpresas(true);
    try {
      const [areasRes, cargosRes, minasRes, almacenesRes, empresasRes] =
        await Promise.all([
          AuxService.get_areas().catch(() => ({ success: false, data: [] })),
          AuxService.get_cargos().catch(() => ({ success: false, data: [] })),
          AuxService.get_minas().catch(() => ({ success: false, data: [] })),
          AuxService.get_almacenes({ es_principal: false }).catch(() => ({
            success: false,
            data: [],
          })),
          AuxService.get_empresas().catch(() => ({ success: false, data: [] })),
        ]);
      if (areasRes.success) setAreas(areasRes.data as RES_Area[]);
      if (cargosRes.success) setTodosCargos(cargosRes.data as RES_Cargo[]);
      if (minasRes.success) setMinas(minasRes.data as RES_Mina[]);
      if (almacenesRes.success) {
        const data = almacenesRes.data as Array<{
          id_almacen: number;
          nombre: string;
          es_principal: number;
        }>;
        setAlmacenes(data);
      }
      if (empresasRes.success)
        setEmpresas(empresasRes.data as RES_Empresa[]);
    } finally {
      setLoadingAreas(false);
      setLoadingCargos(false);
      setLoadingMinas(false);
      setLoadingAlmacenes(false);
      setLoadingEmpresas(false);
    }
  }, []);

  useEffect(() => {
    cargarCatalogos();
  }, [cargarCatalogos]);

  // Cargar labores cuando cambia idMinaLocal
  useEffect(() => {
    if (idMinaLocal && idMinaLocal > 0) {
      AuxService.get_labores({ id_mina: idMinaLocal })
        .then((res) => {
          if (res.success) {
            setLabores(res.data ?? []);
          } else {
            setLabores([]);
          }
        })
        .catch(() => setLabores([]));
    } else {
      setLabores([]);
      setForm((prev) => ({ ...prev, id_labor: null }));
    }
  }, [idMinaLocal]);

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

  const setIdMina = (v: number | null) => {
    setIdMinaLocal(v);
    setForm((prev) => ({ ...prev, id_labor: null }));
  };

  const handleAddEvidencia = (file: File | File[] | null) => {
    if (!file) return;
    setEvidencias((prev) => [...prev, ...(Array.isArray(file) ? file : [file])]);
  };

  const handleRemoveEvidencia = (index: number) => {
    setEvidencias((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearEvidencias = () => setEvidencias([]);

  const handleSubmit = async () => {
    const validation = Schema_CrearContratoEmpleado.safeParse(form);
    if (!validation.success) {
      notify({ type: "info", content: validation.error.issues[0].message });
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
        // El backend ahora devuelve `{ contrato, empleado }`.
        // El contrato es lo que pasamos al callback.
        const payload = resp.data as unknown as {
          contrato?: RES_ContratoEmpleado;
        };
        if (payload?.contrato) {
          onSuccess?.(payload.contrato);
        } else {
          onSuccess?.(resp.data as unknown as RES_ContratoEmpleado);
        }
        setForm(initialForm(idEmpleado));
        setEvidencias([]);
        setIdArea(null);
        setIdMinaLocal(null);
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
    idMina: idMinaLocal,
    setIdMina,
    setConContrato: (v: boolean) =>
      setField("por_tiempo_indefinido", v),
    evidencias,
    handleAddEvidencia,
    handleRemoveEvidencia,
    handleClearEvidencias,
    areas,
    cargos,
    cargosSelectData,
    minas,
    empresas,
    empresasSelectData,
    almacenes,
    labores,
    loadingAreas,
    loadingCargos,
    loadingMinas,
    loadingAlmacenes,
    loadingEmpresas,
    tiposContratoOptions: TIPOS_CONTRATO_OPTIONS,
    periodosDuracionOptions: PERIODOS_DURACION,
    duracionDiasCalc,
    loading,
    handleSubmit,
  };
};
