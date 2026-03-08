import { Group, Select, TextInput, Button, Text, Stack } from "@mantine/core";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { useNuevoContrato } from "../hooks/useNuevoContrato";

interface NuevoContratoProps {
  idConcesion: number;
  onSuccess: () => void;
}

export const NuevoContrato = ({
  idConcesion,
  onSuccess,
}: NuevoContratoProps) => {
  const { empresas, loading, loadingAccion, handleCrearContrato } =
    useNuevoContrato(idConcesion, onSuccess);

  const [idEmpresa, setIdEmpresa] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState("");

  const fieldClasses = {
    input:
      "bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500",
    label: "text-zinc-400 text-xs mb-1",
  };

  const handleSubmit = async () => {
    if (!idEmpresa || !fechaInicio) return;
    await handleCrearContrato(parseInt(idEmpresa), fechaInicio);
    setIdEmpresa(null);
    setFechaInicio("");
  };

  return (
    <Stack
      gap="sm"
      className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50"
    >
      <Text
        size="sm"
        fw={600}
        className="text-zinc-300 flex items-center gap-2"
      >
        <UserPlusIcon className="w-5 h-5 text-indigo-400" />
        Añadir Contrato
      </Text>
      <Group align="flex-end" grow>
        <Select
          label="Empresa"
          placeholder={loading ? "Cargando empresas..." : "Seleccione empresa"}
          data={empresas.map((e) => ({
            value: e.id_empresa.toString(),
            label: e.nombre_comercial,
          }))}
          value={idEmpresa}
          onChange={setIdEmpresa}
          classNames={fieldClasses}
          radius="lg"
          searchable
          required
          disabled={loading}
        />
        <TextInput
          label="Fecha Inicio"
          type="date"
          classNames={fieldClasses}
          radius="lg"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.currentTarget.value)}
          required
        />
        <Button
          onClick={handleSubmit}
          loading={loadingAccion}
          radius="lg"
          className="bg-indigo-600 hover:bg-indigo-700 h-[38px]"
          disabled={!idEmpresa || !fechaInicio}
        >
          Añadir
        </Button>
      </Group>
    </Stack>
  );
};
