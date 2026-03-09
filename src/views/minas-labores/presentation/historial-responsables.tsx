import { Badge, Button, Loader, Text } from "@mantine/core";
import { PlusIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useResponsablesMina } from "../hooks/useResponsables";
import { RegistroResponsable } from "./registro-responsable";
import { useDisclosure } from "@mantine/hooks";
import type {
  RES_ResumenMina,
  RES_HistorialResponsable,
} from "../service/minas.responses";

interface Props {
  mina: RES_ResumenMina;
  onResponsableAsignado?: (nombreResponsable: string) => void;
}

export const HistorialResponsables = ({
  mina,
  onResponsableAsignado,
}: Props) => {
  const [openedForm, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const { historial, loading, handleResponsableAsignado } = useResponsablesMina(
    {
      idMina: mina.id_mina,
      onResponsableAsignado,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white">
            Historial de Responsables
          </h3>
          <p className="text-zinc-500 text-sm">{mina.nombre}</p>
        </div>
        {!openedForm && (
          <Button
            size="xs"
            variant="light"
            color="indigo"
            leftSection={<PlusIcon className="w-4 h-4" />}
            onClick={openForm}
            className="hover:bg-indigo-900/30"
          >
            Asignar Nuevo
          </Button>
        )}
      </div>

      {openedForm && (
        <RegistroResponsable
          idMina={mina.id_mina}
          onSuccess={(nueva) => {
            handleResponsableAsignado(nueva);
            closeForm();
          }}
          onCancel={closeForm}
        />
      )}

      {/* Historial */}
      {historial.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
          <UserIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">
            No hay responsables asignados aún.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((item: RES_HistorialResponsable, idx: number) => {
            const isActive = item.estado?.toUpperCase() === "ACTIVO";
            return (
              <div
                key={item.id_responsable_mina || idx}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-start gap-4 hover:bg-zinc-900/60 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      : "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                  }`}
                >
                  <UserIcon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Text className="text-base font-bold text-white truncate">
                      {item.empleado}
                    </Text>
                    <Badge
                      color={isActive ? "indigo" : "gray"}
                      size="sm"
                      variant={isActive ? "light" : "outline"}
                    >
                      {isActive ? "ACTUAL" : "HISTÓRICO"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <ClockIcon className="w-4 h-4 shrink-0" />
                    <span>
                      {item.fecha_inicio}
                      <span className="mx-1.5 opacity-40">|</span>
                      {item.fecha_fin ?? "Presente"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
