import { useState, useEffect } from "react";
import {
  Stack,
  Group,
  TextInput,
  Select,
  Switch,
  Button,
  NumberInput,
  Text,
  Divider,
  Alert,
} from "@mantine/core";
import {
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useRegistroContratoEmpleado } from "../hooks/useRegistroContratoEmpleado";
import { TipoContrato } from "../../../shared/enums/tipo-contrato";
import { MultiFilePicker } from "../../../presentation/utils/archivo/multifile-picker";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import type { DTO_CrearEmpleado } from "../../personal/service/empleados.requests";
import { useNotify } from "../../../hooks/useNotify";
import { ContratosEmpleadoService } from "../service/contratos-empleado.service";
import {
  Schema_CrearContratoEmpleado,
  type DTO_CrearContratoEmpleado,
} from "../service/contratos-empleado.requests";

interface FormularioContratoEmpleadoProps {
  idEmpleado: number;
  onSuccess?: (payload?: unknown) => void;
  onCancel?: () => void;
  embedded?: boolean;
  /**
   * Si se pasa, en lugar de hacer un POST standalone, se usa el endpoint
   * orquestador `POST /api/empleados/con-contrato` con los datos del empleado.
   */
  formEmpleado?: DTO_CrearEmpleado;
  fotoEmpleado?: File | null;
  /**
   * Contrato anterior del mismo empleado. Si se pasa, se pre-rellenan los
   * campos del nuevo contrato con los valores del anterior (excepto fechas
   * y remuneración editable). El usuario puede cambiar todo.
   */
  contratoAnterior?: import("../../../service/responses/contrato-empleado").RES_ContratoEmpleado;
}

const toNum = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Convierte un valor (Date | string | null | undefined) a un string YYYY-MM-DD.
 * Si es Date → ISO sin hora.
 * Si es string → lo retorna tal cual.
 * Si es null/undefined → "".
 */
const toIsoDate = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "";
  if (v instanceof Date) {
    if (isNaN(v.getTime())) return "";
    return v.toISOString().split("T")[0];
  }
  if (typeof v === "string") return v;
  return "";
};

/**
 * Formatea un valor (Date | string | null | undefined) como DD/MM/YYYY.
 */
const formatDateDisplay = (
  val: Date | string | null | undefined,
): string => {
  const iso = toIsoDate(val);
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const FormularioContratoEmpleado = ({
  idEmpleado,
  onSuccess,
  onCancel,
  embedded = false,
  formEmpleado,
  fotoEmpleado,
  contratoAnterior,
}: FormularioContratoEmpleadoProps) => {
  const { notify } = useNotify();
  const {
    form,
    setField,
    idArea,
    setIdArea,
    idMina,
    setIdMina,
    evidencias,
    setEvidencias,
    areas,
    cargosSelectData,
    minas,
    empresasSelectData,
    almacenes,
    labores,
    loadingAreas,
    loadingCargos,
    loadingMinas,
    loadingAlmacenes,
    loadingEmpresas,
    tiposContratoOptions,
    periodosDuracionOptions,
    duracionDiasCalc,
    loading,
    handleSubmit,
  } = useRegistroContratoEmpleado(idEmpleado, (payload) => onSuccess?.(payload));

  const [fechaFinError, setFechaFinError] = useState<string | null>(null);
  const [datosPrecargados, setDatosPrecargados] = useState(false);

  // Pre-rellenar el form con los datos del contrato anterior (solo una vez al montar)
  useEffect(() => {
    if (contratoAnterior && !datosPrecargados && !form.id_cargo) {
      // Cargo
      if (contratoAnterior.id_cargo) {
        setField("id_cargo", contratoAnterior.id_cargo);
      }
      // Empresa
      if (contratoAnterior.id_empresa) {
        setField("id_empresa", contratoAnterior.id_empresa);
      }
      // Tipo de contrato
      if (
        contratoAnterior.tipo_contrato === "Planilla" ||
        contratoAnterior.tipo_contrato === "JornadaDiaria"
      ) {
        setField(
          "tipo_contrato",
          contratoAnterior.tipo_contrato as
            | "Planilla"
            | "JornadaDiaria",
        );
      }
      // Remuneración según tipo
      if (contratoAnterior.tipo_contrato === "Planilla") {
        if (contratoAnterior.sueldo_base !== null) {
          setField(
            "sueldo_base",
            Number(contratoAnterior.sueldo_base),
          );
        }
      } else if (contratoAnterior.tipo_contrato === "JornadaDiaria") {
        if (contratoAnterior.salario_diario !== null) {
          setField(
            "salario_diario",
            Number(contratoAnterior.salario_diario),
          );
        }
      }
      // Por tiempo indefinido
      setField(
        "por_tiempo_indefinido",
        Boolean(contratoAnterior.por_tiempo_indefinido),
      );
      // Almacén
      if (contratoAnterior.id_almacen) {
        setField("id_almacen", contratoAnterior.id_almacen);
      }
      // Labor (el form se setea al renderizar por su prop)
      // Y si la labor tiene mina, setear la mina también
      if (contratoAnterior.id_labor) {
        // No podemos setear id_labor directamente al estado del form
        // porque no está en el formState del hook. Lo setamos vía el useEffect del hook.
        setField("id_labor", contratoAnterior.id_labor);
      }
      if (contratoAnterior.id_mina_labor) {
        setIdMina(contratoAnterior.id_mina_labor);
      }
      setDatosPrecargados(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contratoAnterior]);

  // Validación reactiva: fecha_fin debe ser >= fecha_inicio
  useEffect(() => {
    if (form.fecha_fin && form.fecha_inicio && form.fecha_fin < form.fecha_inicio) {
      setFechaFinError("La fecha de fin no puede ser menor a la fecha de inicio");
    } else {
      setFechaFinError(null);
    }
  }, [form.fecha_fin, form.fecha_inicio]);

  const [submitting, setSubmitting] = useState(false);

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
    label: "text-zinc-300 mb-1 font-medium",
  };

  const esPlanilla = form.tipo_contrato === TipoContrato.Planilla;
  const esJornada = form.tipo_contrato === TipoContrato.JornadaDiaria;
  const esIndefinido = !!form.por_tiempo_indefinido;
  const esEmbebidoConEmpleado = embedded && !!formEmpleado;

  const handleFinal = async () => {
    // Si viene del form de empleado, usa el endpoint orquestador
    if (esEmbebidoConEmpleado) {
      // Forzar un id_empleado válido solo para pasar la validación.
      // El endpoint orquestador ignora este campo (se borra abajo) y crea
      // el empleado nuevo junto con el contrato.
      const formParaValidar = { ...form, id_empleado: 1 };
      const validation = SchemaOrq(formParaValidar);
      if (!validation.success) {
        notify({
          type: "info",
          content: validation.error.issues[0].message,
        });
        return;
      }
      const totalSize = (fotoEmpleado ? fotoEmpleado.size : 0) + evidencias.reduce((acc, f) => acc + f.size, 0);
      if (totalSize > 8 * 1024 * 1024) {
        notify({
          type: "error",
          content: "El total de archivos supera el límite máximo permitido.",
        });
        return;
      }

      setSubmitting(true);
      try {
        const empleadoPayload: Record<string, unknown> = {
          ...formEmpleado,
        };
        const contratoPayload: Record<string, unknown> = {
          ...validation.data,
        };
        delete contratoPayload.id_empleado;

        const resp =
          await ContratosEmpleadoService.crear_empleado_con_contrato(
            empleadoPayload,
            contratoPayload,
            fotoEmpleado ?? null,
            evidencias,
          );

        if (!resp.success) {
          notify({ type: "error", content: resp.message || "Error" });
          return;
        }
        notify({ type: "success", content: resp.message });
        onSuccess?.(resp.data);
      } catch (err) {
        console.error(err);
        notify({
          type: "error",
          content: "Error inesperado al registrar empleado con contrato",
        });
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Modo standalone: POST /api/contratos-empleado
    await handleSubmit();
  };

  const submittingTotal = submitting || loading;

  return (
    <Stack gap="md">
      <Divider label="Cargo y Empresa" labelPosition="left" />

      <Group grow align="flex-start" gap="md">
        <Select
          label="Área"
          placeholder={loadingAreas ? "Cargando áreas..." : "Seleccione área"}
          data={areas.map((a) => ({
            value: a.id_area.toString(),
            label: a.nombre,
          }))}
          value={idArea?.toString() || null}
          onChange={(val) => setIdArea(val ? Number(val) : null)}
          leftSection={<BriefcaseIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          searchable
          disabled={loadingAreas || submittingTotal}
          comboboxProps={{ withinPortal: true }}
        />
        <Select
          label="Cargo"
          placeholder={loadingCargos ? "Cargando..." : "Seleccione cargo"}
          data={cargosSelectData}
          value={
            form.id_cargo && form.id_cargo > 0 ? String(form.id_cargo) : null
          }
          onChange={(val) => setField("id_cargo", val ? Number(val) : 0)}
          leftSection={<BriefcaseIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          required
          withAsterisk
          disabled={loadingCargos || submittingTotal}
          searchable
          comboboxProps={{ withinPortal: true }}
        />
      </Group>

      <Group grow align="flex-start" gap="md">
        <Select
          label="Empresa (opcional)"
          placeholder={
            loadingEmpresas ? "Cargando empresas..." : "Seleccione empresa"
          }
          data={empresasSelectData}
          value={form.id_empresa ? String(form.id_empresa) : null}
          onChange={(val) =>
            setField("id_empresa", val ? Number(val) : null)
          }
          leftSection={<BuildingOfficeIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          searchable
          clearable
          comboboxProps={{ withinPortal: true }}
          disabled={loadingEmpresas || submittingTotal}
        />
        <Select
          label="Tipo de Contrato"
          placeholder="Seleccione"
          data={tiposContratoOptions}
          value={form.tipo_contrato ?? null}
          onChange={(val) =>
            setField(
              "tipo_contrato",
              (val as TipoContrato) ?? TipoContrato.Planilla,
            )
          }
          leftSection={<DocumentTextIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          required
          comboboxProps={{ withinPortal: true }}
          disabled={submittingTotal}
        />
      </Group>

      <Divider label="Remuneración" labelPosition="left" />
      <Group grow align="flex-start" gap="md">
        {esPlanilla && (
          <NumberInput
            label="Sueldo Base (S/)"
            placeholder="Ej. 1500.00"
            decimalScale={2}
            fixedDecimalScale
            hideControls
            value={form.sueldo_base ?? ""}
            onChange={(v) => setField("sueldo_base", toNum(v))}
            leftSection={<CurrencyDollarIcon className="w-4 h-4 text-zinc-500" />}
            classNames={fieldClasses}
            radius="lg"
            size="xs"
            min={0}
            disabled={submittingTotal}
            withAsterisk
          />
        )}
        {esJornada && (
          <NumberInput
            label="Salario Diario (S/)"
            placeholder="Ej. 50.00"
            decimalScale={2}
            fixedDecimalScale
            hideControls
            value={form.salario_diario ?? ""}
            onChange={(v) => setField("salario_diario", toNum(v))}
            leftSection={<BanknotesIcon className="w-4 h-4 text-zinc-500" />}
            classNames={fieldClasses}
            radius="lg"
            size="xs"
            min={0}
            disabled={submittingTotal}
            withAsterisk
          />
        )}
      </Group>

      <Divider label="Vigencia del contrato" labelPosition="left" />
      <Group grow align="flex-start" gap="md">
        <CustomDatePicker
          label="Fecha de Inicio"
          placeholder="Seleccione fecha"
          value={form.fecha_inicio || null}
          onChange={(val) => setField("fecha_inicio", toIsoDate(val))}
          size="xs"
          disabled={submittingTotal}
        />
        <CustomDatePicker
          label="Fecha de Fin"
          placeholder="Seleccione fecha"
          value={form.fecha_fin || null}
          onChange={(val) => setField("fecha_fin", toIsoDate(val))}
          size="xs"
          disabled={esIndefinido || submittingTotal}
          error={fechaFinError ?? undefined}
          minDate={
            form.fecha_inicio ? new Date(`${form.fecha_inicio}T00:00:00`) : undefined
          }
        />
      </Group>

      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
          esIndefinido
            ? "bg-indigo-500/10 border-indigo-500/40"
            : "bg-zinc-900/50 border-zinc-800"
        }`}
      >
        <div className="flex flex-col">
          <Text size="sm" fw={700} className="text-zinc-200 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
            ¿Por tiempo indefinido?
          </Text>
          <Text size="11px" c="dimmed" className="leading-snug">
            Si activa esta opción, no se solicitará duración ni fecha de fin.
          </Text>
        </div>
        <Switch
          checked={esIndefinido}
          onChange={(e) =>
            setField("por_tiempo_indefinido", e.currentTarget.checked)
          }
          color="indigo"
          size="md"
          disabled={submittingTotal}
        />
      </div>

      {!esIndefinido && (
        <Group grow align="flex-start" gap="md">
          <NumberInput
            label="Duración"
            placeholder="Ej. 3"
            hideControls
            value={form.duracion ?? ""}
            onChange={(v) => setField("duracion", toNum(v))}
            leftSection={<CalendarIcon className="w-4 h-4 text-zinc-500" />}
            classNames={fieldClasses}
            radius="lg"
            size="xs"
            min={1}
            disabled={submittingTotal}
          />
          <Select
            label="Periodo"
            placeholder="Seleccione"
            data={periodosDuracionOptions}
            value={form.periodo_duracion ?? null}
            onChange={(val) =>
              setField(
                "periodo_duracion",
                val as "diario" | "semanal" | "mensual" | "anual" | null,
              )
            }
            leftSection={<CalendarIcon className="w-4 h-4 text-zinc-500" />}
            classNames={fieldClasses}
            radius="lg"
            size="xs"
            comboboxProps={{ withinPortal: true }}
            disabled={submittingTotal}
          />
          <TextInput
            label="Duración (días)"
            value={duracionDiasCalc !== null ? `${duracionDiasCalc}` : ""}
            readOnly
            placeholder="Se calcula automático"
            leftSection={<ClockIcon className="w-4 h-4 text-zinc-500" />}
            classNames={{
              ...fieldClasses,
              input: `${fieldClasses.input} bg-zinc-950/50 text-zinc-400 cursor-not-allowed`,
            }}
            radius="lg"
            size="xs"
          />
        </Group>
      )}

      <Divider label="Lugar de trabajo" labelPosition="left" />
      <Alert
        variant="light"
        color="indigo"
        radius="md"
        icon={<ExclamationCircleIcon className="w-4 h-4" />}
        styles={{ message: { fontSize: "12px" } }}
      >
        Debe seleccionar <strong>al menos uno</strong>: almacén o labor donde
        prestará servicios el empleado.
      </Alert>
      <Group grow align="flex-start" gap="md">
        <Select
          label="Mina (opcional)"
          placeholder={loadingMinas ? "Cargando..." : "Seleccione mina"}
          data={minas.map((m) => ({
            value: m.id_mina.toString(),
            label: m.nombre,
          }))}
          value={idMina?.toString() || null}
          onChange={(val) => setIdMina(val ? Number(val) : null)}
          leftSection={<MapPinIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          searchable
          comboboxProps={{ withinPortal: true }}
          disabled={loadingMinas || submittingTotal}
        />
        <Select
          label="Labor (opcional)"
          placeholder={
            !idMina ? "Primero seleccione mina" : "Seleccione labor"
          }
          data={labores.map((l) => ({
            value: l.id_labor.toString(),
            label: l.nombre,
          }))}
          value={form.id_labor ? String(form.id_labor) : null}
          onChange={(val) =>
            setField("id_labor", val ? Number(val) : null)
          }
          leftSection={<MapPinIcon className="w-4 h-4 text-zinc-500" />}
          classNames={fieldClasses}
          radius="lg"
          size="xs"
          searchable
          comboboxProps={{ withinPortal: true }}
          disabled={!idMina || submittingTotal}
        />
      </Group>
      <Select
        label="Almacén (opcional)"
        placeholder={
          loadingAlmacenes ? "Cargando almacenes..." : "Seleccione almacén"
        }
        data={almacenes.map((a) => ({
          value: a.id_almacen.toString(),
          label: a.nombre,
        }))}
        value={form.id_almacen ? String(form.id_almacen) : null}
        onChange={(val) =>
          setField("id_almacen", val ? Number(val) : null)
        }
        leftSection={<BuildingOfficeIcon className="w-4 h-4 text-zinc-500" />}
        classNames={fieldClasses}
        radius="lg"
        size="xs"
        searchable
        clearable
        comboboxProps={{ withinPortal: true }}
        disabled={loadingAlmacenes || submittingTotal}
      />

      <Divider label="Evidencias (opcional)" labelPosition="left" />
      <MultiFilePicker
        files={evidencias}
        onFilesChange={setEvidencias}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
        multiple
        label="Adjuntar evidencias"
        description="Imágenes o documentos (PDF, JPG, PNG, XLSX, etc.)"
      />
      {/* Suprimido: los botones "Limpiar todas" y "Quitar última" — el MultiFilePicker
          ya tiene su propio "Limpiar todo" y tachito por archivo. */}

      {esEmbebidoConEmpleado && (
        <Alert
          variant="light"
          color="indigo"
          radius="md"
          icon={<CheckCircleIcon className="w-4 h-4" />}
          styles={{ message: { fontSize: "12px" } }}
        >
          Si todo está conforme, se asignará el contrato al empleado{" "}
          <strong>
            {formEmpleado?.nombre} {formEmpleado?.apellido}
          </strong>
          .
        </Alert>
      )}

      <Group justify="space-between" mt="md">
        <div className="text-xs text-zinc-500">
          {duracionDiasCalc !== null && !esIndefinido && (
            <Text size="xs" c="dimmed">
              Vigencia calculada: {formatDateDisplay(form.fecha_inicio)} → {formatDateDisplay(form.fecha_fin)} ({duracionDiasCalc} días)
            </Text>
          )}
        </div>
        {!embedded && (
          <Group gap="md">
            {onCancel && (
              <Button
                variant="subtle"
                onClick={onCancel}
                disabled={submittingTotal}
                radius="lg"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                Cancelar
              </Button>
            )}
            <Button
              loading={submittingTotal}
              onClick={() => {
                void handleFinal();
              }}
              radius="lg"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8"
            >
              {esEmbebidoConEmpleado
                ? "Guardar Empleado y Contrato"
                : "Guardar Contrato"}
            </Button>
          </Group>
        )}
      </Group>

      {embedded && onCancel && (
        <Group justify="flex-end" gap="md" mt="md">
          <Button
            variant="subtle"
            onClick={onCancel}
            disabled={submittingTotal}
            radius="lg"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            Cancelar
          </Button>
          <Button
            loading={submittingTotal}
            onClick={() => {
              void handleFinal();
            }}
            radius="lg"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8"
          >
            {esEmbebidoConEmpleado
              ? "Guardar Empleado y Contrato"
              : "Guardar Contrato"}
          </Button>
        </Group>
      )}
    </Stack>
  );
};

// Validación Zod local (duplicado del import) — usado en modo embebido
const SchemaOrq = (data: unknown) =>
  Schema_CrearContratoEmpleado.safeParse(
    data as DTO_CrearContratoEmpleado,
  );

// Re-export de tipo auxiliar
export type { TipoContrato };
