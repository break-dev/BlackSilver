import {
  Stack,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
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
import { useMemo } from "react";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";

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
    pushNuevoContrato,
  } = useGestionContratos(idConcesion);

  const empresasConContratoActivo = useMemo(
    () =>
      contratos.reduce((acc, c) => {
        if (c.estado == EstadoBase.Activo) acc.push(c.id_empresa);
        return acc;
      }, [] as number[]),
    [contratos],
  );

  return (
    <Stack gap="lg">
      {/* FORMULARIO AÑADIR CONTRATO — siempre visible, incluye nombre concesión */}
      <NuevoContrato
        idConcesion={idConcesion}
        nombreConcesion={nombreConcesion}
        empresasConContratoActivo={empresasConContratoActivo}
        onSuccess={(nuevo) => {
          pushNuevoContrato(nuevo);
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
            <Stack gap="sm">
              {[1, 2, 3].map((i) => (
                <Group
                  key={i}
                  wrap="nowrap"
                  className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg"
                >
                  <Skeleton height={40} width={40} radius="xl" />
                  <Stack gap={6} className="flex-1">
                    <Skeleton height={13} width="50%" radius="sm" />
                    <Skeleton height={10} width="35%" radius="sm" />
                  </Stack>
                </Group>
              ))}
            </Stack>
          )}

          {/* ── ESTADO VACÍO ── */}
          {!loading && contratos.length === 0 && (
            <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/60 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800/50 border border-zinc-700 flex items-center justify-center mb-3">
                <BuildingOffice2Icon className="size-6 text-zinc-600" />
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
          {!loading &&
            contratos.map((c) => {
              const estaTerminando = loadingIdContrato === c.id_contrato;
              const isActive = c.estado === "Activo";

              return (
                <div
                  key={c.id_contrato}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 ${
                    estaTerminando
                      ? "opacity-50 scale-[0.99] border-red-500/20 bg-red-900/5"
                      : isActive
                        ? "bg-zinc-900/30 border-zinc-800/50"
                        : "bg-zinc-900/10 border-zinc-800/30 opacity-50 grayscale-50"
                  }`}
                >
                  {/* Ícono empresa */}
                  <div
                    className={`size-10 rounded-full flex items-center justify-center shrink-0 border ${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                    }`}
                  >
                    <BuildingOffice2Icon className="size-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Text className="text-sm font-bold text-white truncate">
                        {c.razon_social}
                      </Text>
                      {isActive ? (
                        <Badge color="indigo" size="sm" variant="light">
                          ACTIVO
                        </Badge>
                      ) : (
                        <Badge color="gray" size="sm" variant="outline">
                          INACTIVO
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <CalendarIcon className="size-3.5 shrink-0" />
                      <span className="font-mono">{c.ruc}</span>
                      <span className="opacity-40 mx-0.5">·</span>
                      <span>
                        {c.fecha_inicio}
                        <span className="mx-1 opacity-40">|</span>
                        {c.fecha_fin ?? "Presente"}
                      </span>
                    </div>
                  </div>

                  {/* Acción terminar */}
                  {isActive && (
                    <Tooltip label="Finalizar Contrato">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() =>
                          handleTerminarContrato(
                            c.id_contrato,
                            onContratoTerminado,
                          )
                        }
                        loading={estaTerminando}
                        className="shrink-0"
                      >
                        <TrashIcon className="size-4" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </div>
              );
            })}
        </Stack>
      </Stack>
    </Stack>
  );
};
