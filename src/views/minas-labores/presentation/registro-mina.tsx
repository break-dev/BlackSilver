import { Stack, Group, Select, TextInput, Textarea, Button } from "@mantine/core";
import type { RES_ConcesionItem, RES_ResumenMina } from "../service/minas.responses";
import { useRegistroMina } from "../hooks/useRegistroMina";

interface Props {
  concesiones: RES_ConcesionItem[];
  onSuccess: (nueva: RES_ResumenMina) => void;
  onCancel: () => void;
}

const fieldClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  label: "text-zinc-300 mb-1 font-medium",
};

export const RegistroMina = ({ concesiones, onSuccess, onCancel }: Props) => {
  const {
    idConcesion,
    setIdConcesion,
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    formError,
    isSubmitting,
    handleSubmit,
    handleCancel,
  } = useRegistroMina({ concesiones, onSuccess, onCancel });

  return (
    <Stack gap="md">
      <Select
        label="Concesión"
        placeholder="Selecciona una concesión..."
        data={concesiones.map((c) => ({
          value: String(c.id_concesion),
          label: c.nombre,
        }))}
        value={idConcesion}
        onChange={setIdConcesion}
        disabled={isSubmitting}
        withAsterisk
        searchable
        nothingFoundMessage="No hay concesiones disponibles"
        radius="lg"
        classNames={fieldClasses}
      />

      <TextInput
        label="Nombre de la Mina"
        placeholder="Ej. Mina Esperanza - Nivel 1"
        required
        withAsterisk
        disabled={isSubmitting}
        radius="lg"
        classNames={fieldClasses}
        value={nombre}
        onChange={(e) => setNombre(e.currentTarget.value)}
      />

      <Textarea
        label="Descripción / Zona"
        placeholder="Ej. Zona Norte, acceso principal..."
        radius="lg"
        minRows={3}
        disabled={isSubmitting}
        classNames={fieldClasses}
        value={descripcion}
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
