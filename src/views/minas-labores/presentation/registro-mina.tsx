import { Button, Group, TextInput, Textarea } from "@mantine/core";
import type { RES_ResumenMina } from "../service/minas.responses";
import { useRegistroMina } from "../hooks/useRegistroMina";

interface Props {
  idConcesion: number;
  onSuccess: (nueva: RES_ResumenMina) => void;
  onCancel: () => void;
}

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 text-white placeholder:text-zinc-500",
  label: "text-zinc-300 mb-1 font-medium",
};

export const RegistroMina = ({ idConcesion, onSuccess, onCancel }: Props) => {
  const {
    nombre,
    setNombre,
    descripcion,
    setDescripcion,
    formError,
    isSubmitting,
    handleSubmit,
    handleCancel,
  } = useRegistroMina({ idConcesion, onSuccess, onCancel });

  return (
    <div className="space-y-5">
      <TextInput
        label="Nombre de la Mina"
        placeholder="Ej. Mina Esperanza - Nivel 1"
        required
        withAsterisk
        disabled={isSubmitting}
        radius="lg"
        classNames={inputClasses}
        value={nombre}
        onChange={(e) => setNombre(e.currentTarget.value)}
      />

      <Textarea
        label="Descripción / Zona"
        placeholder="Ej. Zona Norte, acceso principal..."
        radius="lg"
        minRows={3}
        disabled={isSubmitting}
        classNames={inputClasses}
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
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        >
          Cancelar
        </Button>
        <Button
          loading={isSubmitting}
          onClick={handleSubmit}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
        >
          Guardar
        </Button>
      </Group>
    </div>
  );
};
