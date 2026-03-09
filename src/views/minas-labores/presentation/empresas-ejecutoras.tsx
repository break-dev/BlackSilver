import { Loader, Text } from "@mantine/core";
import { BriefcaseIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { RegistroEmpresaEjecutora } from "./registro-empresa-ejecutora";
import { useEmpresasEjecutoras } from "../hooks/useEmpresasEjecutoras";

interface Props {
  idMina: number;
  idConcesion: number;
}

export const EmpresasEjecutoras = ({ idMina, idConcesion }: Props) => {
  const { ejecutoras, loading, handleEmpresaAsignada } = useEmpresasEjecutoras(
    {
      idMina,
    },
  );

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader size="sm" color="gray" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sección de Registro/Asignación */}
      <RegistroEmpresaEjecutora
        idMina={idMina}
        idConcesion={idConcesion}
        onSuccess={handleEmpresaAsignada}
      />

      {/* Ejecutoras actuales */}
      <div className="space-y-3">
        <Text
          size="xs"
          className="text-zinc-500 uppercase tracking-wider font-semibold"
        >
          Empresas Ejecutoras Asignadas
        </Text>

        {ejecutoras.length === 0 ? (
          <div className="flex flex-col items-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
            <BriefcaseIcon className="w-8 h-8 text-zinc-700 mb-2" />
            <Text size="sm" className="text-zinc-500">
              No hay empresas asignadas a esta mina
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {ejecutoras.map((emp) => (
              <div
                key={emp.id_empresa_mina}
                className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/10 shrink-0 shadow-inner">
                    <BriefcaseIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <Text className="text-sm font-bold text-white tracking-tight">
                      {emp.razon_social}
                    </Text>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                      <IdentificationIcon className="w-4 h-4 text-zinc-600" />
                      <span>RUC: {emp.ruc}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
