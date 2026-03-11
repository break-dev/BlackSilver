import { Button, Select, Loader, Stack, Group, Box, Text } from "@mantine/core";
import { BriefcaseIcon } from "@heroicons/react/24/outline";
import { useNotify } from "../../../hooks/useNotify";
import { useRegistroEmpresaEjecutora } from "../hooks/useRegistroEmpresaEjecutora";
import type { RES_EmpresaEjecutora } from "../service/minas.responses";

interface Props {
  idMina: number;
  idConcesion: number;
  onSuccess: (nueva: RES_EmpresaEjecutora) => void;
}

const inputClasses = {
  input:
    "bg-zinc-900/50 border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-white placeholder:text-zinc-500 transition-all",
  label: "text-zinc-300 mb-1 font-medium",
  dropdown: "bg-zinc-900 border-zinc-800",
  option:
    "hover:bg-zinc-800 text-zinc-300 data-[selected]:bg-zinc-100 data-[selected]:text-zinc-900 rounded-md my-0.5",
};

export const RegistroEmpresaEjecutora = ({
  idMina,
  idConcesion,
  onSuccess,
}: Props) => {
  const { notify } = useNotify();
  const {
    disponibles,
    loadingDisponibles,
    isSubmitting,
    idEmpresa,
    setIdEmpresa,
    asignarEmpresa,
  } = useRegistroEmpresaEjecutora({ idMina, idConcesion });

  const handleAsignar = async () => {
    if (!idEmpresa) return;
    try {
      const nueva = await asignarEmpresa(idEmpresa);
      onSuccess(nueva);
      notify({
        type: "success",
        content: "Empresa vinculada correctamente",
      });
    } catch (e: any) {
      notify({ type: "error", content: e.message });
    }
  };

  return (
    <Stack
      gap="md"
      className="animate-fade-in p-4 border border-zinc-800 bg-zinc-900/40 rounded-xl"
    >
      {/* Header — Estilo unificado */}
      <Group gap="sm" align="center">
        <Box className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
          <BriefcaseIcon className="w-4 h-4 text-cyan-400" />
        </Box>
        <Stack gap={0}>
          <Text
            size="xs"
            fw={700}
            className="text-zinc-300 uppercase tracking-wider"
          >
            Vincular Empresa
          </Text>
          <Text size="xs" className="text-zinc-500">
            Asignar contratista a la mina
          </Text>
        </Stack>
      </Group>

      {/* Formulario */}
      <div className="space-y-4">
        <Select
          label="Empresa Contratista"
          placeholder="Seleccione una empresa"
          withAsterisk
          leftSection={<BriefcaseIcon className="w-4 h-4 text-zinc-400" />}
          data={disponibles.map((e) => ({
            value: String(e.id_empresa),
            label: e.razon_social,
          }))}
          value={idEmpresa ? String(idEmpresa) : null}
          onChange={(v) => setIdEmpresa(v ? parseInt(v) : null)}
          searchable
          nothingFoundMessage="No hay empresas disponibles"
          classNames={inputClasses}
          radius="lg"
          disabled={isSubmitting || loadingDisponibles}
          rightSection={loadingDisponibles && <Loader size={14} color="gray" />}
        />

        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            variant="filled"
            className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20 px-6"
            loading={isSubmitting}
            disabled={!idEmpresa}
            onClick={handleAsignar}
            radius="lg"
          >
            Vincular Empresa
          </Button>
        </div>
      </div>
    </Stack>
  );
};
