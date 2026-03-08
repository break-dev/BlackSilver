import { Badge, Button, Loader, Text } from "@mantine/core";
import { useEffect } from "react";
import { PlusIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import "dayjs/locale/es";
import type { IMessage } from "../../../shared/enums/message";
import type {
  RES_Almacen,
  RES_ResponsableAlmacen,
} from "../service/almacenes.responses";
import { useHistorialResponsables } from "../hooks/useHistorialResponsables";
import { NuevoResponsable } from "./nuevo-responsable";

interface HistorialResponsablesProps {
  almacen: RES_Almacen;
  onMessage?: (msg: IMessage) => void;
  onUpdateResponsable?: (nombre: string) => void;
}

export const HistorialResponsables = ({
  almacen,
  onMessage,
  onUpdateResponsable,
}: HistorialResponsablesProps) => {
  const {
    responsables,
    loading,
    message,
    showForm,
    setShowForm,
    agregarResponsable,
  } = useHistorialResponsables(almacen.id_almacen);

  // Burbujear mensajes hacia el hook de la página
  useEffect(() => {
    if (message.type && message.content) onMessage?.(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  if (showForm) {
    return (
      <NuevoResponsable
        idAlmacen={almacen.id_almacen}
        nombreAlmacen={almacen.nombre}
        onMessage={onMessage}
        onSuccess={(nuevo) => {
          agregarResponsable(nuevo);
          if (onUpdateResponsable) onUpdateResponsable(nuevo.nombre_completo);
          setShowForm(false);
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">
            Historial de Responsables
          </h3>
          <p className="text-zinc-500 text-sm">{almacen.nombre}</p>
        </div>
        <Button
          size="xs"
          variant="light"
          color="indigo"
          leftSection={<PlusIcon className="w-4 h-4" />}
          onClick={() => setShowForm(true)}
          className="hover:bg-indigo-900/30 transition-colors"
        >
          Asignar Nuevo
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader size="sm" color="gray" />
        </div>
      ) : responsables.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
          <UserIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-500 text-sm">
            No hay responsables asignados aún.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {responsables.map((item: RES_ResponsableAlmacen, idx: number) => {
            const isActive = item.estado?.toUpperCase() === "ACTIVO";
            return (
              <div
                key={item.id_responsable_almacen || idx}
                className="relative p-4 rounded-xl border flex items-start gap-4 transition-all border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60"
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
                      {item.nombre_completo}
                    </Text>
                    {isActive ? (
                      <Badge color="indigo" size="sm" variant="light">
                        ACTUAL
                      </Badge>
                    ) : (
                      <Badge color="gray" size="sm" variant="outline">
                        HISTÓRICO
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                    <ClockIcon className="w-4 h-4 shrink-0" />
                    <span>
                      {dayjs(item.fecha_inicio).format("YYYY-MM-DD")}
                      <span className="mx-1.5 opacity-40">|</span>
                      {item.fecha_fin
                        ? dayjs(item.fecha_fin).format("YYYY-MM-DD")
                        : "Presente"}
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
