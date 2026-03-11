import {
  Stack,
  Text,
  Badge,
  ActionIcon,
  Group,
  Skeleton,
} from "@mantine/core";
import {
  TrashIcon,
  CalendarIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { useGestionContratos } from "../hooks/useGestionContratos";
import { NuevoContrato } from "./nuevo-contrato";

interface HistorialContratosProps {
  idConcesion: number;
  nombreConcesion: string;
  onContratoCreado?: () => void;
  onContratoTerminado?: () => void;
}

export const HistorialContratos = ({
  idConcesion,
  nombreConcesion,
  onContratoCreado,
  onContratoTerminado,
}: HistorialContratosProps) => {
  const {
    contratos,
    loading,
    loadingIdContrato,
    handleTerminarContrato,
    recargar,
  } = useGestionContratos(idConcesion);

  const empresasConContratoActivo = contratos
    .filter((c) => c.estado === "Activo")
    .map((c) => c.id_empresa);

  return (
    <Stack gap="lg">
      {/* FORMULARIO AÑADIR CONTRATO — siempre visible, incluye nombre concesión */}
      <NuevoContrato
        idConcesion={idConcesion}
        nombreConcesion={nombreConcesion}
        empresasConContratoActivo={empresasConContratoActivo}
        onSuccess={() => {
          recargar();
          onContratoCreado?.();
        }}
      />

      {/* SECCIÓN: EMPRESAS ASIGNADAS */}
      <Stack gap="sm">
        <Group gap="xs" align="center">
          <div className="h-px flex-1 bg-zinc-800" />
          <Text
            size="xs"
            fw={700}
            className="text-zinc-500 uppercase tracking-widest px-2"
          >
            Empresas Asignadas
          </Text>
          <div className="h-px flex-1 bg-zinc-800" />
        </Group>

        <Stack gap="sm">

          {/* ── SKELETON mientras carga ── */}
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <Group
                  key={i}
                  wrap="nowrap"
                  align="flex-start"
                  className="p-4 rounded-2xl border border-zinc-800/50 bg-zinc-900/30"
                >
                  <Skeleton height={44} width={44} radius="lg" />
                  <Stack gap={6} className="flex-1">
                    <Skeleton height={14} width="55%" radius="sm" />
                    <Skeleton height={10} width="20%" radius="sm" />
                    <Skeleton height={10} width="35%" radius="sm" />
                    <Skeleton height={10} width="45%" radius="sm" />
                  </Stack>
                </Group>
              ))}
            </>
          )}

          {/* ── ESTADO VACÍO ── */}
          {!loading && contratos.length === 0 && (
            <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/60 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mb-3">
                <BuildingOffice2Icon className="w-6 h-6 text-zinc-600" />
              </div>
              <Text size="sm" className="text-zinc-500">
                Sin empresas asignadas
              </Text>
              <Text size="xs" className="text-zinc-600 mt-0.5">
                Crea el primer contrato
              </Text>
            </div>
          )}

          {/* ── CARDS ── */}
          {!loading && contratos.map((c) => {
            const estaTerminando = loadingIdContrato === c.id_contrato;

            return (
              <Group
                key={c.id_contrato}
                wrap="nowrap"
                align="flex-start"
                className={`p-4 rounded-2xl border transition-all duration-300 ${estaTerminando
                    ? "opacity-50 scale-[0.99] border-red-500/20 bg-red-900/5"
                    : c.estado === "Activo"
                      ? "bg-zinc-900/40 border-zinc-800 shadow-xl"
                      : "bg-zinc-900/10 border-zinc-800/40 opacity-50 grayscale-[50%]"
                  }`}
              >
                {/* Ícono empresa */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center border shrink-0 ${c.estado === "Activo"
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-900/20"
                      : "bg-zinc-800/50 border-zinc-700 text-zinc-500"
                    }`}
                >
                  <BuildingOffice2Icon className="w-5 h-5" />
                </div>

                {/* Info */}
                <Stack gap={4} className="flex-1 min-w-0">
                  <Group gap="xs" align="center" wrap="nowrap">
                    <Text size="sm" fw={700} className="text-zinc-100 truncate leading-tight">
                      {c.nombre_comercial}
                    </Text>
                    <Badge
                      size="xs"
                      variant={c.estado === "Activo" ? "filled" : "outline"}
                      color={c.estado === "Activo" ? "indigo" : "gray"}
                      radius="sm"
                      className="font-bold tracking-tighter shrink-0"
                    >
                      {c.estado === "Activo" ? "ACTIVO" : "INACTIVO"}
                    </Badge>
                  </Group>
                  <Text size="xs" className="text-zinc-500 font-mono">
                    {c.ruc}
                  </Text>
                  <Group gap={4} className="mt-0.5">
                    <CalendarIcon className="w-3 h-3 text-zinc-600" />
                    <Text size="xs" className="text-zinc-500">
                      {c.fecha_inicio} | {c.fecha_fin ?? "Presente"}
                    </Text>
                  </Group>
                </Stack>

                {/* Acción terminar */}
                {c.estado === "Activo" && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    radius="md"
                    size="sm"
                    onClick={() =>
                      handleTerminarContrato(c.id_contrato, onContratoTerminado)
                    }
                    loading={estaTerminando}
                    title="Finalizar Contrato"
                    className="hover:bg-red-500/10 shrink-0"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </ActionIcon>
                )}
              </Group>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};
