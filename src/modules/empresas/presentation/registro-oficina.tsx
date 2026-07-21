import {
  Button,
  Group,
  TextInput,
  Stack,
  Text,
  Switch,
} from "@mantine/core";
import { BuildingOffice2Icon, MapPinIcon } from "@heroicons/react/24/outline";

interface RegistroOficinaProps {
  idEmpresa: number;
  empresaNombre: string;
  nombre: string;
  setNombre: (val: string) => void;
  direccion: string;
  setDireccion: (val: string) => void;
  esPrincipal: boolean;
  setEsPrincipal: (val: boolean) => void;
  error: string;
  loading: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const RegistroOficina = ({
  idEmpresa,
  empresaNombre,
  nombre,
  setNombre,
  direccion,
  setDireccion,
  esPrincipal,
  setEsPrincipal,
  error,
  loading,
  onSave,
  onCancel,
}: RegistroOficinaProps) => {
  const inputClasses = {
    input: `bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 
    focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500`,
    label: "text-zinc-300 mb-1 font-medium",
  };

  return (
    <Stack gap="md">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl 
        bg-indigo-500/10 border border-indigo-500/20"
      >
        <div className="bg-indigo-500/20 p-2 rounded-lg shrink-0">
          <BuildingOffice2Icon className="w-5 h-5 text-indigo-300" />
        </div>
        <div className="flex-1 min-w-0">
          <Text size="10px" fw={700} className="text-indigo-300 uppercase tracking-wider">
            Empresa asociada
          </Text>
          <Text size="sm" fw={600} className="text-white truncate">
            {empresaNombre}
          </Text>
        </div>
      </div>

      <input type="hidden" value={idEmpresa} readOnly />

      <TextInput
        label="Nombre de la oficina"
        placeholder="Ej. Sede Central Lima"
        required
        withAsterisk
        disabled={loading}
        radius="lg"
        maxLength={128}
        classNames={inputClasses}
        value={nombre}
        onChange={(e) => setNombre(e.currentTarget.value)}
      />

      <TextInput
        label="Dirección"
        placeholder="Ej. Av. Javier Prado Este 420, San Isidro"
        disabled={loading}
        radius="lg"
        maxLength={256}
        leftSection={<MapPinIcon className="w-4 h-4 text-zinc-500" />}
        classNames={inputClasses}
        value={direccion}
        onChange={(e) => setDireccion(e.currentTarget.value)}
      />

      <div
        className="flex items-center justify-between gap-3 px-4 py-3 
        rounded-xl bg-zinc-900/40 border border-zinc-800/60"
      >
        <div className="flex-1 min-w-0">
          <Text size="sm" fw={600} className="text-white">
            Oficina principal
          </Text>
          <Text size="xs" className="text-zinc-500 mt-0.5">
            Se mostrará como sede matriz de la empresa
          </Text>
        </div>
        <Switch
          checked={esPrincipal}
          onChange={(e) => setEsPrincipal(e.currentTarget.checked)}
          disabled={loading}
          color="indigo"
          size="md"
        />
      </div>

      {error && (
        <div
          className="text-red-500 text-sm font-medium px-3 py-2 
          bg-red-500/10 rounded-lg border border-red-500/20"
        >
          {error}
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
          loading={loading}
          onClick={onSave}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 border-0 px-8"
        >
          Registrar Oficina
        </Button>
      </Group>
    </Stack>
  );
};
