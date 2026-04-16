import {
  Badge,
  Text,
  Stack,
  Skeleton,
  Group,
  ActionIcon,
  Tooltip,
  ScrollArea,
} from "@mantine/core";
import { UserIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useResponsablesMina } from "../../hooks/responsables/useResponsables";
import {
  RegistroResponsable,
  type RegistroResponsableRef,
} from "./registro-responsable";
import type {
  RES_ResumenMina,
  RES_HistorialResponsable,
} from "../../service/minas.responses";
import dayjs from "dayjs";
import { useRef } from "react";

interface Props {
  mina: RES_ResumenMina;
  onResponsableAsignado?: (nombreResponsable: string) => void;
}

export const HistorialResponsables = ({
  mina,
  onResponsableAsignado,
}: Props) => {
  const registroRef = useRef<RegistroResponsableRef>(null);

  const {
    historial,
    loading,
    loadingInactivando,
    handleResponsableAsignado,
    handleInactivarResponsable,
  } = useResponsablesMina({
    idMina: mina.id_mina,
    onResponsableAsignado,
  });

  const onInactivar = async (item: RES_HistorialResponsable) => {
    const success = await handleInactivarResponsable(
      item.id_responsable_mina!,
      dayjs().format("YYYY-MM-DD"),
    );

    if (success && item.id_empleado) {
      registroRef.current?.agregarDisponible({
        id_empleado: item.id_empleado,
        empleado: item.empleado,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Formulario siempre visible igual que Almacenes */}
      <RegistroResponsable
        ref={registroRef}
        idMina={mina.id_mina}
        nombreMina={mina.nombre}
        onSuccess={(nueva) => {
          handleResponsableAsignado(nueva);
        }}
      />

      {/* Separador estilizado */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-zinc-800" />
        <Text
          size="xs"
          fw={700}
          className="text-zinc-500 uppercase tracking-widest px-2"
        >
          Historial de Responsables
        </Text>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Skeletons mientras carga */}
      {loading && (
        <Stack gap="sm">
          {[1, 2, 3].map((i) => (
            <Group
              key={i}
              wrap="nowrap"
              className="p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl"
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

      {/* Estado vacío */}
      {!loading && historial.length === 0 && (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
          <UserIcon className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm font-medium">
            No hay responsables asignados aún
          </p>
        </div>
      )}

      {/* Lista de responsables con scroll */}
      {!loading && historial.length > 0 && (
        <ScrollArea h={350} offsetScrollbars type="hover" scrollbarSize={6}>
          <div className="grid gap-3 pr-3">
            {historial.map((item: RES_HistorialResponsable, idx: number) => {
              const isActive = item.estado?.toUpperCase() === "ACTIVO";
              const currentLoading =
                loadingInactivando === item.id_responsable_mina;

              return (
                <div
                  key={item.id_responsable_mina || idx}
                  className="flex items-center gap-3 p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 hover:border-zinc-700/50 transition-all duration-200"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                    }`}
                  >
                    <UserIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <Text className="text-sm font-bold text-white truncate">
                        {item.empleado}
                      </Text>
                      {isActive ? (
                        <Badge color="indigo" size="sm" variant="light">
                          RESPONSABLE
                        </Badge>
                      ) : (
                        <Badge color="gray" size="sm" variant="outline">
                          DESHABILITADO
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <ClockIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {dayjs(item.fecha_inicio).format("YYYY-MM-DD")}
                        <span className="mx-1.5 opacity-40">|</span>
                        {item.fecha_fin
                          ? dayjs(item.fecha_fin).format("YYYY-MM-DD")
                          : "Presente"}
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <Tooltip label="Inhabilitar Responsable" position="left">
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        radius="md"
                        size="lg"
                        className="hover:bg-red-500/10"
                        loading={currentLoading}
                        onClick={() => onInactivar(item)}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
