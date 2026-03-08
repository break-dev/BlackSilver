import { Stack, Group, TextInput, Select, Button } from "@mantine/core";
import { TicketIcon } from "@heroicons/react/24/outline";
import { useRegistroConcesion } from "../hooks/useRegistroConcesion";
import type { RES_Concesion } from "../service/concesiones.responses";

interface RegistroConcesionProps {
  onSuccess: (nueva: RES_Concesion) => void;
}

export const RegistroConcesion = ({ onSuccess }: RegistroConcesionProps) => {
  const { form, setField, handleSubmit, loading } =
    useRegistroConcesion(onSuccess);

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
    label: "text-zinc-400 text-xs mb-1",
  };

  return (
    <Stack gap="lg">
      <Group grow align="flex-start">
        <TextInput
          label="Nombre de Concesión"
          placeholder="Ej. San Juan 1"
          value={form.nombre}
          onChange={(e) => setField("nombre", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
          required
        />
        <TextInput
          label="Código Concesión"
          placeholder="Ej. 01020304"
          value={form.codigo_concesion}
          onChange={(e) => setField("codigo_concesion", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
          required
        />
      </Group>

      <Group grow align="flex-start">
        <TextInput
          label="Código REINFO"
          placeholder="Ej. R-0001"
          value={form.codigo_reinfo || ""}
          onChange={(e) => setField("codigo_reinfo", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
        />
        <TextInput
          label="Ubigeo"
          placeholder="Ej. 150101"
          value={form.ubigeo || ""}
          onChange={(e) => setField("ubigeo", e.currentTarget.value)}
          classNames={fieldClasses}
          radius="lg"
        />
      </Group>

      <Select
        label="Tipo Mineral"
        placeholder="Seleccione tipo"
        data={["Metálico", "No Metálico"]}
        value={form.tipo_mineral}
        onChange={(val) => setField("tipo_mineral", val)}
        classNames={fieldClasses}
        radius="lg"
        required
      />

      <Button
        fullWidth
        onClick={handleSubmit}
        loading={loading}
        radius="lg"
        className="bg-indigo-600 hover:bg-indigo-700 h-[42px] mt-2"
        leftSection={<TicketIcon className="w-5 h-5" />}
      >
        Registrar Concesión
      </Button>
    </Stack>
  );
};
