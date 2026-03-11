import { Loader, Text, Stack, Group, Skeleton, Box } from "@mantine/core";
import { BriefcaseIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { RegistroEmpresaEjecutora } from "./registro-empresa-ejecutora";
import { useEmpresasEjecutoras } from "../hooks/useEmpresasEjecutoras";

interface Props {
  idMina: number;
  idConcesion: number;
}

export const EmpresasEjecutoras = ({ idMina, idConcesion }: Props) => {
  const { ejecutoras, loading, handleEmpresaAsignada } = useEmpresasEjecutoras({
    idMina,
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sección de Registro/Asignación */}
      <RegistroEmpresaEjecutora
        idMina={idMina}
        idConcesion={idConcesion}
        onSuccess={handleEmpresaAsignada}
      />

      {/* Separador estilizado */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-zinc-800" />
        <Text
          size="xs"
          fw={700}
          className="text-zinc-500 uppercase tracking-widest px-2"
        >
          Empresas Ejecutoras
        </Text>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Skeletons mientras carga */}
      {loading && (
        <Stack gap="sm">
          {[1, 2].map((i) => (
            <Group
              key={i}
              wrap="nowrap"
              className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl"
            >
              <Skeleton height={44} width={44} radius="lg" />
              <Stack gap={6} className="flex-1">
                <Skeleton height={14} width="60%" radius="sm" />
                <Skeleton height={10} width="40%" radius="sm" />
              </Stack>
            </Group>
          ))}
        </Stack>
      )}

      {/* Estado vacío */}
      {!loading && ejecutoras.length === 0 && (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
          <BriefcaseIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm font-medium">
            No hay empresas asignadas a esta mina
          </p>
        </div>
      )}

      {/* Lista de empresas */}
      {!loading && ejecutoras.length > 0 && (
        <div className="grid gap-3">
          {ejecutoras.map((emp) => (
            <div
              key={emp.id_empresa_mina}
              className="flex items-center gap-4 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shrink-0">
                <BriefcaseIcon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <Text className="text-sm font-bold text-white truncate">
                  {emp.razon_social}
                </Text>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 font-medium">
                  <IdentificationIcon className="w-3.5 h-3.5 text-zinc-600" />
                  <span>RUC: {emp.ruc}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
