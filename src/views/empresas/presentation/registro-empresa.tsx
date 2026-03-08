import { Button, Group, TextInput, Stack } from "@mantine/core";

interface RegistroEmpresaProps {
  ruc: string;
  setRuc: (val: string) => void;
  razonSocial: string;
  setRazonSocial: (val: string) => void;
  nombreComercial: string;
  setNombreComercial: (val: string) => void;
  abreviatura: string;
  setAbreviatura: (val: string) => void;
  error: string;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const RegistroEmpresa = ({
  ruc,
  setRuc,
  razonSocial,
  setRazonSocial,
  nombreComercial,
  setNombreComercial,
  abreviatura,
  setAbreviatura,
  error,
  loading,
  onSave,
  onCancel,
}: RegistroEmpresaProps) => {
  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 
    focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <Stack gap="md">
      <TextInput
        label="RUC"
        placeholder="Ej. 20123456789"
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        maxLength={11}
        classNames={inputClasses}
        value={ruc}
        onChange={(e) => setRuc(e.currentTarget.value)}
      />

      <TextInput
        label="Razón Social"
        placeholder="Ej. Black Silver S.A.C."
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        value={razonSocial}
        onChange={(e) => setRazonSocial(e.currentTarget.value)}
      />

      <TextInput
        label="Nombre Comercial"
        placeholder="Ej. Black Silver"
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        value={nombreComercial}
        onChange={(e) => setNombreComercial(e.currentTarget.value)}
      />

      <TextInput
        label="Abreviatura"
        placeholder="Ej. BS"
        disabled={loading}
        radius="lg"
        classNames={inputClasses}
        value={abreviatura}
        onChange={(e) => setAbreviatura(e.currentTarget.value)}
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
