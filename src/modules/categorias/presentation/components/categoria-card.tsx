import { Badge, Button, Group, ScrollArea, Tooltip } from "@mantine/core";
import {
  PlusIcon,
  ClipboardDocumentCheckIcon,
  TruckIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { RES_CategoriaResumen } from "../../service/categorias.responses";
import { TipoBien } from "../../../../shared/enums/_generic/tipo-bien";

interface CategoriaCardProps {
  cat: RES_CategoriaResumen;
  onAddDestino: (cat: RES_CategoriaResumen) => void;
}

export const CategoriaCard = ({ cat, onAddDestino }: CategoriaCardProps) => {
  const isActive = cat.estado === "Activo";

  return (
    <div
      key={cat.id_categoria}
      className="group relative flex flex-col bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 gap-3 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-200"
    >
      <Badge
        size="xs"
        variant="light"
        color={isActive ? "green" : "red"}
        radius="sm"
        className="absolute top-3 right-3"
      >
        {cat.estado}
      </Badge>

      <div className="pr-14">
        {/* Áreas Operativas Arriba */}
        <Group gap={6} mb={8}>
          {/* {!!cat.para_mina && (
            <Badge
              variant="light"
              color="blue"
              size="xs"
              radius="sm"
              leftSection={<TruckIcon className="w-3 h-3" />}
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
              leftSection={<FireIcon className="w-3 h-3" />}
            >
              Cocina
            </Badge>
          )} */}
          {!!cat.es_auditable && (
            <Badge variant="light" color="red" size="xs" radius="sm">
              Auditable
            </Badge>
          )}
        </Group>

        <h3
          className="text-sm font-bold text-white truncate group-hover:text-indigo-300 
          transition-colors uppercase tracking-tight"
        >
          {cat.nombre}
        </h3>
        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
          {cat.descripcion || "Sin descripción proporcionada"}
        </p>
      </div>

      {/* Control Logístico */}
      {!!cat.es_consumible && (
        <div
          className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl 
        bg-indigo-500/10 border border-indigo-500/20 group-hover:border-indigo-400/40 
          transition-all duration-200"
        >
          <div className="flex-1 min-w-0">
            <span
              className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider 
              block leading-none mb-1.5"
            >
              Destinos ({cat.categorias_consumidoras?.length || 0})
            </span>
            {cat.categorias_consumidoras &&
            cat.categorias_consumidoras.length > 0 ? (
              <ScrollArea
                w="100%"
                type="never"
                scrollbarSize={0}
                offsetScrollbars={false}
              >
                <div className="flex items-center gap-1.5 pb-0.5">
                  {cat.categorias_consumidoras.map((dest, idx) => (
                    <Badge
                      key={idx}
                      variant="filled"
                      color="indigo.9"
                      size="xs"
                      radius="sm"
                      className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 lowercase first-letter:uppercase shrink-0"
                    >
                      {dest.nombre}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <span className="text-xs font-semibold text-zinc-500 italic block">
                Sin destinos asignados
              </span>
            )}
          </div>

          <Button
            variant="filled"
            color="indigo"
            size="xs"
            leftSection={<PlusIcon className="w-3 h-3" />}
            radius="md"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 h-7 shrink-0"
            onClick={() => onAddDestino(cat)}
          >
            Añadir
          </Button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50 mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
          <ClipboardDocumentCheckIcon className="w-3.5 h-3.5" />
          <span className="text-zinc-400 italic truncate max-w-[120px]">
            {cat.clasificacion_bien || (
              <span className="text-zinc-600">Sin Clasificación</span>
            )}
          </span>
        </div>

        <Group gap={8}>
          {/* Indicadores de Activo Fijo — Estilo Premium */}
          {cat.clasificacion_bien === TipoBien.ActivoFijo && (
            <Group gap={4}>
              {!!cat.para_transporte && (
                <Tooltip label="Transporte / Vehículo" position="top" withArrow>
                  <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
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
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
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
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ClockIcon className="w-3.5 h-3.5" />
                  </div>
                </Tooltip>
              )}
              {!!cat.control_por_vueltas && (
                <Tooltip
                  label="Control por Vueltas"
                  position="top"
                  withArrow
                >
                  <div className="w-6 h-6 rounded-md bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                  </div>
                </Tooltip>
              )}
            </Group>
          )}

          <Tooltip label="Tipo">
            <Badge
              size="xs"
              variant="filled"
              color="pink"
              radius="md"
              className="font-bold px-2.5 h-5 text-white shadow-sm shadow-pink-900/20"
            >
              {cat.tipo_producto || "S.T."}
            </Badge>
          </Tooltip>
        </Group>
      </div>
    </div>
  );
};
