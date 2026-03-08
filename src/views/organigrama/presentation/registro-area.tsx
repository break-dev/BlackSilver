import { Button, Group, TextInput, Stack } from "@mantine/core";

interface Props {
  nombre: string;
  setNombre: (v: string) => void;
  loading: boolean;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}

export const RegistroArea = ({
  nombre,
  setNombre,
  loading,
  error,
  onSave,
  onCancel,
}: Props) => {
  const fieldClasses = {
    input: "bg-zinc-900/50 border-zinc-800 text-white",
    label: "text-zinc-300 font-medium mb-1",
  };

  return (
    <Stack gap="md">
      <TextInput
        label="Nombre del Área"
        placeholder="Ej. Operaciones, Recursos Humanos..."
        required
        disabled={loading}
        radius="lg"
        classNames={fieldClasses}
        value={nombre}
        onChange={(e) => setNombre(e.currentTarget.value)}
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          color="gray"
          onClick={onCancel}
          disabled={loading}
          radius="lg"
        >
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          loading={loading}
          radius="lg"
          className="bg-indigo-600"
        >
          Guardar
        </Button>
      </Group>
    </Stack>
  );
};
