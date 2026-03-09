import { Loader, Text, ActionIcon, Tooltip } from "@mantine/core";
import {
  PlusIcon,
  BriefcaseIcon,
  XMarkIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { useGestionEmpresasMina } from "../hooks/useGestionEmpresasMina";
import type { RES_ResumenMina } from "../service/minas.responses";

interface Props {
  idMina: number;
  idConcesion: number;
}

export const GestionEmpresasMina = ({ idMina, idConcesion }: Props) => {
  const {
    ejecutoras,
    disponibles,
    loading,
    loadingAdd,
    asignarEmpresa,
    desasignarEmpresa,
  } = useGestionEmpresasMina({ idMina, idConcesion });

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Añadir ejecutora */}
      {disponibles.length > 0 && (
        <div className="space-y-2">
          <Text
            size="xs"
            className="text-zinc-500 uppercase tracking-wider font-semibold"
          >
            Agregar empresa ejecutora
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
                <Tooltip label="Asignar">
                  <ActionIcon
                    size="sm"
                    variant="light"
                    color="indigo"
                    loading={loadingAdd}
                    onClick={() => asignarEmpresa(emp.id_empresa)}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </ActionIcon>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ejecutoras actuales */}
      <div className="space-y-2">
        <Text
          size="xs"
          className="text-zinc-500 uppercase tracking-wider font-semibold"
        >
          Empresas ejecutoras asignadas
        </Text>

        {ejecutoras.length === 0 ? (
          <div className="flex flex-col items-center py-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <BriefcaseIcon className="w-6 h-6 text-zinc-600 mb-2" />
            <Text size="sm" className="text-zinc-500">
              No hay empresas asignadas
            </Text>
          </div>
        ) : (
          <div className="space-y-2 animate-fade-in">
            {ejecutoras.map((emp) => (
              <div
                key={emp.id_empresa_mina}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shrink-0">
                    <BriefcaseIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <Text className="text-sm font-bold text-white">
                      {emp.razon_social}
                    </Text>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <IdentificationIcon className="w-3.5 h-3.5" />
                      <span>RUC: {emp.ruc}</span>
                    </div>
                  </div>
                </div>
                <Tooltip label="Quitar empresa">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => desasignarEmpresa(emp.id_empresa_mina)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </ActionIcon>
                </Tooltip>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
