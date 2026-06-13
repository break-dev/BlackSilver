import { useCallback } from "react";
import { Badge, ScrollArea, Tooltip, Button } from "@mantine/core";
import {
  PlusIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { type DataTableColumn } from "mantine-datatable";
import type { RES_CategoriaResumen } from "../service/categorias.responses";

interface UseCategoriasColumnsProps {
  onOpenGestionDestinos: (cat: RES_CategoriaResumen) => void;
}

export const useCategoriasColumns = ({
  onOpenGestionDestinos,
}: UseCategoriasColumnsProps) => {
  const getColumns = useCallback(
    (): DataTableColumn<RES_CategoriaResumen>[] => {
      return [
        {
          accessor: "index",
          title: "#",
          textAlign: "center",
          width: 60,
        },
        {
          accessor: "nombre",
          title: "Nombre",
          width: 250,
          render: (cat: RES_CategoriaResumen) => (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {cat.nombre}
              </span>
              {cat.es_auditable === true && (
                <Badge
                  variant="light"
                  color="red"
                  size="xs"
                  radius="sm"
                  className="font-bold border border-red-500/20 shrink-0"
                >
                  Auditable
                </Badge>
              )}
            </div>
          ),
        },
        {
          accessor: "descripcion",
          title: "Descripción",
          width: 200,
          render: (cat: RES_CategoriaResumen) => (
            <span className="text-xs text-zinc-500 line-clamp-1">
              {cat.descripcion || "Sin descripción"}
            </span>
          ),
        },
        {
          accessor: "para_mina",
          title: "Destino de Uso",
          textAlign: "center",
          width: 160,
          render: (cat: RES_CategoriaResumen) => (
            <div className="flex items-center justify-center gap-1.5">
              {!!cat.para_mina && (
                <Badge
                  variant="light"
                  color="blue"
                  size="xs"
                  radius="sm"
                  className="font-bold border border-blue-500/20"
                >
                  Mina
                </Badge>
              )}
              {!!cat.para_cocina && (
                <Badge
                  variant="light"
                  color="orange"
                  size="xs"
                  radius="sm"
                  className="font-bold border border-orange-500/20"
                >
                  Cocina
                </Badge>
              )}
              {!cat.para_mina && !cat.para_cocina && (
                <span className="text-xs text-zinc-600 font-medium">—</span>
              )}
            </div>
          ),
        },
        {
          accessor: "control_por_odometro",
          title: "Controles",
          width: 180,
          textAlign: "center",
          render: (cat: RES_CategoriaResumen) => {
            const hasControls =
              cat.para_transporte ||
              cat.control_por_odometro ||
              cat.control_por_horometro ||
              cat.control_por_vueltas;

            if (!hasControls) {
              return (
                <span className="text-xs text-zinc-600 font-medium">—</span>
              );
            }

            return (
              <div className="flex items-center gap-1.5 justify-center">
                {!!cat.para_transporte && (
                  <Tooltip
                    label="Transporte / Vehículo"
                    position="top"
                    withArrow
                  >
                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-sm transition-all hover:scale-105">
                      <TruckIcon className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                )}
                {!!cat.control_por_odometro && (
                  <Tooltip
                    label="Control por Odómetro (KM)"
                    position="top"
                    withArrow
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm transition-all hover:scale-105">
                      <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                )}
                {!!cat.control_por_horometro && (
                  <Tooltip
                    label="Control por Horómetro (Horas)"
                    position="top"
                    withArrow
                  >
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm transition-all hover:scale-105">
                      <ClockIcon className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                )}
                {!!cat.control_por_vueltas && (
                  <Tooltip label="Control por Vueltas" position="top" withArrow>
                    <div className="w-6 h-6 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-sm transition-all hover:scale-105">
                      <ArrowPathIcon className="w-3.5 h-3.5" />
                    </div>
                  </Tooltip>
                )}
              </div>
            );
          },
        },
        {
          accessor: "es_consumible",
          title: "Destinos de Consumo",
          render: (cat: RES_CategoriaResumen) => {
            if (!cat.es_consumible) {
              return (
                <span className="text-xs text-zinc-500 italic tracking-wider">
                  No es consumible
                </span>
              );
            }
            return (
              <div className="flex items-center gap-3 wrap-nowrap">
                <div className="flex-1 min-w-0 max-w-[240px]">
                  {cat.categorias_consumidoras &&
                  cat.categorias_consumidoras.length > 0 ? (
                    <ScrollArea w="100%" type="never">
                      <div className="flex items-center gap-1.5 wrap-nowrap pb-0.5">
                        {cat.categorias_consumidoras.map((dest, idx) => (
                          <Badge
                            key={idx}
                            variant="light"
                            color="indigo"
                            size="xs"
                            radius="sm"
                            className="font-bold border border-indigo-500/10 shrink-0 uppercase"
                          >
                            {dest.nombre}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <span className="text-xs font-semibold text-zinc-500 italic block">
                      Sin destinos
                    </span>
                  )}
                </div>
                <Button
                  variant="subtle"
                  color="indigo"
                  size="xs"
                  leftSection={<PlusIcon className="w-3 h-3" />}
                  radius="md"
                  className="h-7 hover:bg-indigo-950/40 text-indigo-300 shrink-0"
                  onClick={() => onOpenGestionDestinos(cat)}
                >
                  Destinos
                </Button>
              </div>
            );
          },
        },
        {
          accessor: "estado",
          title: "Estado",
          width: 100,
          textAlign: "center",
          render: (cat: RES_CategoriaResumen) => (
            <Badge
              color={cat.estado === "Activo" ? "teal.9" : "gray.9"}
              variant="filled"
              size="xs"
              radius="sm"
              className="font-black border border-zinc-800 shadow-md mx-auto"
            >
              {cat.estado.toUpperCase()}
            </Badge>
          ),
        },
      ];
    },
    [onOpenGestionDestinos],
  );

  return { getColumns };
};
