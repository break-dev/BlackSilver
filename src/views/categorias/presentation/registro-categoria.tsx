import {
  Button,
  Group,
  TextInput,
  Textarea,
  Stack,
  Select,
} from "@mantine/core";

interface RegistroCategoriaProps {
  nombre: string;
  setNombre: (val: string) => void;
  descripcion: string;
  setDescripcion: (val: string) => void;
  tipoRequerimiento: string | null;
  setTipoRequerimiento: (val: string | null) => void;
  clasificacionBien: string | null;
  setClasificacionBien: (val: string | null) => void;
  error: string;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const RegistroCategoria = ({
  nombre,
  setNombre,
  descripcion,
  setDescripcion,
  tipoRequerimiento,
  setTipoRequerimiento,
  clasificacionBien,
  setClasificacionBien,
  error,
  loading,
  onSave,
  onCancel,
}: RegistroCategoriaProps) => {
  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 
    focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Nombre de la Categoría"
        placeholder="Ej. Herramientas, EPP, Consumibles..."
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        value={nombre}
        onChange={(e) => setNombre(e.currentTarget.value)}
      />

      <Select
        label="Tipo de Requerimiento"
        placeholder="Seleccione un tipo..."
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        data={["Bienes", "Servicios"]}
        value={tipoRequerimiento}
        onChange={setTipoRequerimiento}
      />

      <Select
        label="Clasificación del Bien"
        placeholder="Seleccione una clasificación (Opcional)..."
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        data={[
          "Materia Prima",
          "Producto Terminado",
          "Repuesto",
          "Suministro",
          "Otro",
        ]}
        value={clasificacionBien}
        onChange={setClasificacionBien}
      />

      <Textarea
        label="Descripción"
        placeholder="Detalles adicionales sobre esta categoría..."
        radius="lg"
        minRows={3}
        disabled={loading}
        classNames={inputClasses}
        value={descripcion}
        onChange={(e) => setDescripcion(e.currentTarget.value)}
      />

      {error && (
        <div className="text-red-500 text-sm font-medium px-1">{error}</div>
      )}

      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white 
          hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          loading={loading}
          onClick={onSave}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 
          text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 
          shadow-lg border-0"
        >
          Guardar
        </Button>
      </Group>
    </Stack>
  );
};
