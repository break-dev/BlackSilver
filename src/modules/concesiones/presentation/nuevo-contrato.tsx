import { Select, Button, Text, Stack, Group, Box } from "@mantine/core";
import {
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import dayjs from "dayjs";
import { useNuevoContrato } from "../hooks/useNuevoContrato";
import { CustomDatePicker } from "../../../presentation/utils/date-picker-input";
import type { RES_Contrato } from "../service/concesiones.responses";

interface NuevoContratoProps {
  idConcesion: number;
  nombreConcesion: string;
  empresasConContratoActivo: number[];
  onSuccess: (nuevo: RES_Contrato) => void;
}

export const NuevoContrato = ({
  idConcesion,
  nombreConcesion,
  empresasConContratoActivo,
  onSuccess,
}: NuevoContratoProps) => {
  const { empresas, loading, loadingAccion, handleCrearContrato } =
    useNuevoContrato(idConcesion, onSuccess);

  const [idEmpresa, setIdEmpresa] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(new Date());

  const handleSubmit = async () => {
    if (!idEmpresa || !fechaInicio) return;
    const fechaStr = dayjs(fechaInicio).format("YYYY-MM-DD");
    await handleCrearContrato(parseInt(idEmpresa), fechaStr);
    setIdEmpresa(null);
    setFechaInicio(new Date());
  };

  const selectData = empresas.map((e) => ({
    value: e.id_empresa.toString(),
    label: e.nombre_comercial,
    disabled: empresasConContratoActivo.includes(e.id_empresa),
  }));

  return (
    <Stack
      gap="md"
      className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50"
    >
      {/* Header con nombre de concesión */}
      <Group gap="sm" align="center">
        <Box className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <DocumentTextIcon className="w-4 h-4 text-indigo-400" />
        </Box>
        <Stack gap={0}>
          <Text size="xs" fw={700} className="text-zinc-300 uppercase tracking-wider">
            Nuevo Contrato
          </Text>
          <Text size="xs" className="text-zinc-500">
            {nombreConcesion}
          </Text>
        </Stack>
      </Group>

      {/* Grid de 2 columnas iguales */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Empresa"
          placeholder={loading ? "Cargando..." : "Seleccione empresa"}
          data={selectData}
          value={idEmpresa}
          onChange={setIdEmpresa}
          radius="lg"
          size="sm"
          searchable
          required
          disabled={loading}
          classNames={{
            input:
              "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500",
            dropdown: "bg-zinc-900 border-zinc-800",
            option:
              "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 data-[disabled]:text-zinc-600 data-[disabled]:cursor-not-allowed rounded-md my-1",
            label: "text-zinc-300 mb-1 font-medium",
          }}
        />

        <CustomDatePicker
          label="Fecha Inicio"
          placeholder="Seleccione fecha"
          value={fechaInicio}
          onChange={(val) => setFechaInicio(val as Date | null)}
          required
        />
      </div>

      {/* Botón abajo a la derecha */}
      <Group justify="flex-end">
        <Button
          onClick={handleSubmit}
          loading={loadingAccion}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20"
          disabled={!idEmpresa || !fechaInicio}
        >
          Crear Contrato
        </Button>
      </Group>
    </Stack>
  );
};
