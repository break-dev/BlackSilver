import { Button, Group, TextInput, Select } from "@mantine/core";
import { Schema_CrearConcesion } from "../../../../../services/empresas/concesiones/dtos/requests";
import { useConcesion } from "../../../../../services/empresas/concesiones/useConcesion";

// Formulario para registrar o editar una concesión
interface RegistroConcesionProps {
  setSuccess: (value: boolean) => void;
  onCancel: () => void;
}

export const RegistroConcesion = ({
  setSuccess,
  onCancel,
}: RegistroConcesionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [id_empresa, setIdEmpresa] = useState<number>();
  const [nombre, setNombre] = useState<string>();

  const { crearConcesion } = useConcesion({ setIsLoading, setError });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = Schema_CrearConcesion.safeParse({ id_empresa, nombre });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    try {
      const success = await crearConcesion(validation.data);
    } catch (error) {
      console.error("Error en crear concesion:", error);
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
      <Select
        label="Empresa"
        placeholder="Seleccione empresa"
        data={empresasOptions}
        searchable
        nothingFoundMessage="No se encontraron empresas"
        required
        withCheckIcon={false}
        comboboxProps={{
          transitionProps: { transition: "pop", duration: 200 },
        }}
        radius="lg"
        size="sm"
        classNames={{
          input:
            "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
          dropdown: "bg-zinc-900 border-zinc-800",
          option:
            "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-1",
          label: "text-zinc-300 mb-1 font-medium",
        }}
        {...form.getInputProps("id_empresa")}
      />

      <TextInput
        label="Nombre de Concesión"
        placeholder="Ej. Concesión Alfa 1"
        required
        radius="lg"
        size="sm"
        classNames={{
          input:
            "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
          label: "text-zinc-300 mb-1 font-medium",
        }}
        {...form.getInputProps("nombre")}
      />

      <Group justify="flex-end" gap="md" mt="xl">
        <Button
          variant="subtle"
          onClick={onCancel}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={loading}
          radius="lg"
          size="sm"
          className="bg-linear-to-r from-zinc-100 to-zinc-300 text-zinc-900 font-semibold hover:from-white hover:to-zinc-200 shadow-lg border-0"
        >
          Guardar
        </Button>
      </Group>
    </form>
  );
};
