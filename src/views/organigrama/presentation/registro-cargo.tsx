import { Button, Group, TextInput, Stack, Select } from "@mantine/core";
import type { RES_Area } from "../service/organigrama.responses";

interface Props {
  nombre: string;
  setNombre: (v: string) => void;
  idArea: string | null;
  setIdArea: (v: string | null) => void;
  areas: RES_Area[];
  loading: boolean;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}

export const RegistroCargo = ({
  nombre,
  setNombre,
  idArea,
  setIdArea,
  areas,
  loading,
  error,
  onSave,
  onCancel,
}: Props) => {
  const fieldClasses = {
    input: "bg-zinc-900/50 border-zinc-800 text-white",
    label: "text-zinc-300 font-medium mb-1",
  };

  const areasData = areas.map((a) => ({
    value: a.id_area.toString(),
    label: a.nombre,
  }));

  return (
    <Stack gap="md">
      <Select
        label="Área"
        placeholder="Seleccione el área..."
        required
        disabled={loading}
        radius="lg"
        classNames={fieldClasses}
        data={areasData}
        value={idArea}
        onChange={setIdArea}
      />

      <TextInput
        label="Nombre del Cargo"
        placeholder="Ej. Jefe de Almacén, Operario A..."
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
