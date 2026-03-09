import { ActionIcon, Text, Tooltip, Loader } from "@mantine/core";
import { BriefcaseIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useNotify } from "../../../hooks/useNotify";
import { useRegistroEmpresaEjecutora } from "../hooks/useRegistroEmpresaEjecutora";
import type { RES_EmpresaEjecutora } from "../service/minas.responses";

interface Props {
  idMina: number;
  idConcesion: number;
  onSuccess: (nueva: RES_EmpresaEjecutora) => void;
}

export const RegistroEmpresaEjecutora = ({
  idMina,
  idConcesion,
  onSuccess,
}: Props) => {
  const { notify } = useNotify();
  const { disponibles, loadingDisponibles, isSubmitting, asignarEmpresa } =
    useRegistroEmpresaEjecutora({ idMina, idConcesion });

  const handleAsignar = async (idEmpresa: number) => {
    try {
      const nueva = await asignarEmpresa(idEmpresa);
      onSuccess(nueva);
    } catch (e: any) {
      notify({ type: "error", content: e.message });
    }
  };

  if (loadingDisponibles) {
    return (
      <div className="flex justify-center p-4">
        <Loader size="xs" color="gray" />
      </div>
    );
  }

  if (disponibles.length === 0) return null;

  return (
    <div className="space-y-3 p-4 rounded-xl border border-zinc-700 bg-zinc-900/50">
      <Text
        size="xs"
        className="text-zinc-500 uppercase tracking-wider font-semibold"
      >
        Empresas Disponibles para Asignar
      </Text>
      <div className="space-y-2">
        {disponibles.map((emp) => (
          <div
            key={emp.id_empresa}
            className="flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BriefcaseIcon className="w-4 h-4 text-zinc-500" />
              <Text size="sm" className="text-zinc-300">
                {emp.razon_social}
              </Text>
            </div>
            <Tooltip label="Asignar a Mina">
              <ActionIcon
                size="sm"
                variant="light"
                color="indigo"
                loading={isSubmitting}
                onClick={() => handleAsignar(emp.id_empresa)}
              >
                <PlusIcon className="w-4 h-4" />
              </ActionIcon>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
};
