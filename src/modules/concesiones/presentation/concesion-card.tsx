import { Badge, Text, Tooltip, ActionIcon } from "@mantine/core";
import {
  MapPinIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import type { RES_Concesion } from "../service/concesiones.responses";

interface ConcesionCardProps {
  concesion: RES_Concesion;
  onOpenContratos: (concesion: RES_Concesion) => void;
}

export const ConcesionCard = ({
  concesion,
  onOpenContratos,
}: ConcesionCardProps) => {
  const isActive = concesion.estado === "Activo";

  return (
    <div className="group relative flex flex-col bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 gap-3 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-200">
      {/* Badge de estado — esquina superior derecha */}
      <Badge
        size="xs"
        variant="light"
        color={isActive ? "green" : "gray"}
        radius="sm"
        className="absolute top-3 right-3"
      >
        {concesion.estado}
      </Badge>

      {/* Header: badges + nombre + mineral */}
      <div className="pr-14">
        <div className="flex items-center gap-2 mb-1">
          {concesion.codigo_reinfo && (
            <Badge
              size="xs"
              variant="light"
              color="indigo"
              radius="sm"
              className="font-bold border-indigo-500/20"
            >
              Cod. REINFO: {concesion.codigo_reinfo}
            </Badge>
          )}
        </div>
        <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
          {concesion.nombre}
        </h3>
        <p className="text-xs text-zinc-500 truncate mt-0.5">
          {concesion.tipo_mineral}
        </p>
      </div>

      {/* Ubicación */}
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-zinc-800/40 border border-zinc-800/60">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
          <MapPinIcon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block mb-0.5">
            Ubicación
          </span>
          <Text size="xs" fw={600} className="text-zinc-300 truncate">
            {concesion.ubigeo || "No especificada"}
          </Text>
        </div>
      </div>

      {/* Footer: stats + acción */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <DocumentTextIcon className="w-3.5 h-3.5" />
            {concesion.contratos_activos}{" "}
            {concesion.contratos_activos === 1 ? "contrato" : "contratos"}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1.5">
          <Tooltip label="Ver Contratos">
            <ActionIcon
              variant="filled"
              color="indigo"
              size="sm"
              radius="md"
              onClick={() => onOpenContratos(concesion)}
            >
              <BuildingOfficeIcon className="w-4 h-4" />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
