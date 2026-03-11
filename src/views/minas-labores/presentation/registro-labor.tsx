import {
  Button,
  Group,
  Select,
  TextInput,
  Textarea,
  Loader,
  Stack,
} from "@mantine/core";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import { useRegistroLabor } from "../hooks/useRegistroLabor";
import type { RES_Labor } from "../service/minas.responses";

interface Props {
  idMina: number;
  onSuccess: (labor: RES_Labor) => void;
  onCancel: () => void;
}

const fieldClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  label: "text-zinc-300 mb-1 font-medium",
};

const TIPO_SOSTENIMIENTO_OPTIONS = [
  { value: "Convencional", label: "Convencional" },
  { value: "Mecanizada", label: "Mecanizada" },
];

export const RegistroLabor = ({ idMina, onSuccess, onCancel }: Props) => {
  const {
    tiposLabor,
    empresasEjecutoras,
    loadingSelects,
    idEmpresa,
    setIdEmpresa,
    idTipoLabor,
    setIdTipoLabor,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    tipoSostenimiento,
    setTipoSostenimiento,
    veta,
    setVeta,
    ancho,
    setAncho,
    alto,
    setAlto,
    nivel,
    setNivel,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    formError,
    isSubmitting,
    handleSubmit,
    handleCancel,
  } = useRegistroLabor({ idMina, onSuccess, onCancel });

  if (loadingSelects) {
    return (
      <div className="flex justify-center py-10">
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  return (
    <Stack gap="md" className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Empresa Ejecutora"
          placeholder="Seleccione empresa"
          required
          withAsterisk
          disabled={isSubmitting}
          data={empresasEjecutoras.map((e) => ({
            value: String(e.id_empresa),
            label: e.razon_social,
          }))}
          value={idEmpresa ? String(idEmpresa) : null}
          onChange={(v) => setIdEmpresa(v ? parseInt(v) : null)}
          searchable
          nothingFoundMessage="Sin empresas ejecutoras"
          radius="lg"
          classNames={fieldClasses}
        />

        <Select
          label="Tipo de Labor"
          placeholder="Seleccione tipo"
          required
          withAsterisk
          disabled={isSubmitting}
          data={tiposLabor.map((t) => ({
            value: String(t.id_tipo_labor),
            label: t.nombre,
          }))}
          value={idTipoLabor ? String(idTipoLabor) : null}
          onChange={(v) => setIdTipoLabor(v ? parseInt(v) : null)}
          searchable
          nothingFoundMessage="Sin tipos de labor"
          radius="lg"
          classNames={fieldClasses}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextInput
          label="Nombre de la Labor"
          placeholder="Ej. Tajo Esperanza Nivel 1"
          required
          withAsterisk
          disabled={isSubmitting}
          radius="lg"
          classNames={fieldClasses}
          value={nombre}
          onChange={(e) => setNombre(e.currentTarget.value)}
        />

        <Select
          label="Tipo Sostenimiento"
          placeholder="Seleccione..."
          required
          withAsterisk
          disabled={isSubmitting}
          data={TIPO_SOSTENIMIENTO_OPTIONS}
          value={tipoSostenimiento || null}
          onChange={(v) => setTipoSostenimiento(v || "")}
          radius="lg"
          classNames={fieldClasses}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-800/30 pt-4">
        <CustomDatePicker
          label="Fecha Inicio"
          placeholder="Seleccione fecha de inicio"
          value={fechaInicio}
          onChange={(val: any) => setFechaInicio(val)}
          disabled={isSubmitting}
          required
          withAsterisk
        />
        <CustomDatePicker
          label="Fecha Fin (Opcional)"
          placeholder="Seleccione fecha de término"
          value={fechaFin}
          onChange={(val: any) => setFechaFin(val)}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-zinc-800/30 pt-4">
        <TextInput
          label="Veta"
          placeholder="Veta..."
          radius="lg"
          classNames={fieldClasses}
          value={veta}
          onChange={(e) => setVeta(e.currentTarget.value)}
        />
        <TextInput
          label="Nivel"
          placeholder="Nivel..."
          radius="lg"
          classNames={fieldClasses}
          value={nivel}
          onChange={(e) => setNivel(e.currentTarget.value)}
        />
        <TextInput
          label="Ancho (m)"
          placeholder="0.00"
          type="number"
          step="0.01"
          radius="lg"
          classNames={fieldClasses}
          value={ancho}
          onChange={(e) => setAncho(e.currentTarget.value)}
        />
        <TextInput
          label="Alto (m)"
          placeholder="0.00"
          type="number"
          step="0.01"
          radius="lg"
          classNames={fieldClasses}
          value={alto}
          onChange={(e) => setAlto(e.currentTarget.value)}
        />
      </div>

      <Textarea
        label="Descripción / Detalles"
        placeholder="Ubicación exacta, referencias..."
        radius="lg"
        minRows={2}
        disabled={isSubmitting}
        classNames={fieldClasses}
        value={descripcion ?? ""}
        onChange={(e) => setDescripcion(e.currentTarget.value)}
      />

      {formError && (
        <div className="text-red-400 text-sm font-medium px-1">{formError}</div>
      )}

      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          onClick={handleCancel}
          disabled={isSubmitting}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          loading={isSubmitting}
          onClick={handleSubmit}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8"
        >
          Guardar
        </Button>
      </Group>
    </Stack>
  );
};
