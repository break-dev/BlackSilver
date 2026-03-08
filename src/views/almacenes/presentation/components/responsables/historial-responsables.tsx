import { Badge, Button, Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { PlusIcon, UserIcon, ClockIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import "dayjs/locale/es";
import type { RES_ResponsableAlmacen } from "../../service/almacenes.responses";
import { FormAsignarResponsable } from "./nuevo-responsable";

interface GestionResponsablesProps {
  idAlmacen: number;
  nombreAlmacen?: string;
}

export const HistorialResponsables = ({
  idAlmacen,
  nombreAlmacen,
}: GestionResponsablesProps) => {
  const [responsables, setResponsables] = useState<RES_ResponsableAlmacen[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [, setError] = useState("");
  // UI State
  const [showForm, setShowForm] = useState(false);
  const { listarResponsables } = useAlmacenes({ setError });

  // Cargar historial
  const cargarHistorial = async () => {
    setLoading(true);
    const data = await listarResponsables(idAlmacen);
    if (data) {
      const sorted = [...data].sort((a, b) => {
        const dateDiff =
          new Date(b.fecha_inicio).getTime() -
          new Date(a.fecha_inicio).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.id_responsable_almacen - a.id_responsable_almacen;
      });
      setResponsables(sorted);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarHistorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlmacen]);

  const handleAsignacionExitosa = (
    nuevoResponsable: RES_ResponsableAlmacen,
  ) => {
    setShowForm(false);
    setResponsables((prev) => {
      // Create a new array with the new item added
      const newArray = [nuevoResponsable, ...prev];

      // Sort to ensure the newest is on top
      return newArray.sort((a, b) => {
        const dateDiff =
          new Date(b.fecha_inicio).getTime() -
          new Date(a.fecha_inicio).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.id_responsable_almacen - a.id_responsable_almacen;
      });
    });
  };

  // VISTA: FORMULARIO
  if (showForm) {
    return (
      <FormAsignarResponsable
        idAlmacen={idAlmacen}
        nombreAlmacen={nombreAlmacen}
        onSuccess={handleAsignacionExitosa}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  // VISTA: HISTORIAL (LISTA)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-bold text-white leading-tight">
            Historial de Responsables
          </h3>
          <p className="text-zinc-500 text-sm">
            {nombreAlmacen || "Registro histórico"}
          </p>
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
          {responsables.map((item, idx) => {
            const isActive = item.estado?.toUpperCase() === "ACTIVO";
            const fullName = item.nombre_completo;

            return (
              <div
                key={item.id_responsable_almacen || idx}
                className={`relative p-4 rounded-xl border flex items-start gap-4 transition-all 
                border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60`}
              >
                {/* Left: Avatar / Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border
                    ${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-zinc-800/50 text-zinc-500 border-zinc-700/50"
                    }`}
                >
                  <UserIcon className="w-6 h-6" />
                </div>

                {/* Right: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Text className="text-base font-bold text-white truncate">
                      {fullName}
                    </Text>
                    {isActive ? (
                      <Badge
                        color="indigo"
                        size="sm"
                        variant="light"
                        className="tracking-wide"
                      >
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
