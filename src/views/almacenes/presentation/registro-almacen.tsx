import {
  Button,
  Group,
  TextInput,
  Textarea,
  Switch,
  Stack,
  Text,
} from "@mantine/core";

interface RegistroAlmacenProps {
  nombre: string;
  setNombre: (val: string) => void;
  descripcion: string;
  setDescripcion: (val: string) => void;
  esPrincipal: boolean;
  setEsPrincipal: (val: boolean) => void;
  formError: string;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export const RegistroAlmacen = ({
  nombre,
  setNombre,
  descripcion,
  setDescripcion,
  esPrincipal,
  setEsPrincipal,
  formError,
  loading,
  onSubmit,
  onCancel,
}: RegistroAlmacenProps) => {
  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 
    focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} className="relative space-y-5">
      <Stack gap="md">
        <TextInput
          label="Nombre del Almacén"
          placeholder="Ej. Almacén Central - Mina A"
          required
          withAsterisk
          disabled={loading}
          radius="lg"
          classNames={inputClasses}
          value={nombre}
          onChange={(e) => setNombre(e.currentTarget.value)}
        />

        <Textarea
          label="Descripción"
          placeholder="Detalles adicionales..."
          radius="lg"
          minRows={3}
          disabled={loading}
          classNames={inputClasses}
          value={descripcion}
          onChange={(e) => setDescripcion(e.currentTarget.value)}
        />

        <div
          className="p-3 bg-pink-500/10 border border-pink-500/20 
          rounded-lg flex items-center justify-between"
        >
          <div className="flex flex-col gap-1 pr-4">
            <Text size="sm" fw={600} className="text-pink-200">
              ¿Es Almacén Principal?
            </Text>
            <Text size="xs" className="text-pink-100/70 leading-snug">
              Si lo activa, será el punto de recepción principal.
            </Text>
          </div>
          <Switch
            checked={esPrincipal}
            disabled={loading}
            onChange={(e) => setEsPrincipal(e.currentTarget.checked)}
            color="pink"
            size="md"
            className="cursor-pointer"
          />
        </div>

        {formError && (
          <div className="text-red-500 text-sm font-medium px-1">
            {formError}
          </div>
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
            type="submit"
            loading={loading}
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
    </form>
  );
};
