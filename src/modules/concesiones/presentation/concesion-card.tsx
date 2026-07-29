import {
  Badge,
  Text,
  Tooltip,
  ActionIcon,
  Group,
  Skeleton,
} from "@mantine/core";
import {
  MapPinIcon,
  DocumentTextIcon,
  PlusIcon,
  BuildingOffice2Icon,
  PaperClipIcon,
  TrashIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import type { RES_Concesion } from "../service/concesiones.responses";
import { EstadoBase } from "../../../shared/enums/_generic/estado-base";

interface ConcesionCardProps {
  concesion: RES_Concesion;
  loadingIdContrato: number | null;
  onAddContrato: (concesion: RES_Concesion) => void;
  onOpenEvidencias: (id_contrato: number) => void;
  onTerminarContrato: (id_contrato: number) => void;
}

export const ConcesionCard = ({
  concesion,
  loadingIdContrato,
  onAddContrato,
  onOpenEvidencias,
  onTerminarContrato,
}: ConcesionCardProps) => {
  const isActive = concesion.estado === "Activo";
  const contratos = concesion.contratos ?? [];

  return (
    <div className="group relative flex flex-col bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-4 gap-3 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-200">
      <Badge
        size="xs"
        variant="light"
        color={isActive ? "green" : "gray"}
        radius="sm"
        className="absolute top-3 right-3"
      >
        {concesion.estado}
      </Badge>

      {/* Header */}
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

      {/* Sección Contratos */}
      <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800/50">
        <div className="flex items-center justify-between">
          <Group gap={4}>
            <DocumentTextIcon className="w-3 h-3 text-zinc-500" />
            <Text
              size="10px"
              fw={700}
              className="text-zinc-500 uppercase tracking-wider"
            >
              Contratos ({contratos.length})
            </Text>
          </Group>
          <Tooltip label="Registrar contrato" position="left" withArrow>
            <ActionIcon
              variant="subtle"
              color="indigo"
              size="xs"
              radius="md"
              onClick={() => onAddContrato(concesion)}
              className="hover:bg-indigo-500/10"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </ActionIcon>
          </Tooltip>
        </div>

        {contratos.length > 0 ? (
          <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
            {contratos.map((c) => {
              const isContratoActivo = c.estado === EstadoBase.Activo;
              const estaTerminando = loadingIdContrato === c.id_contrato;

              return (
                <div
                  key={c.id_contrato}
                  className={`flex flex-col gap-1.5 px-2.5 py-2 rounded-lg bg-zinc-950/40 border border-zinc-800/40 hover:border-indigo-500/20 transition-colors ${
                    estaTerminando ? "opacity-50" : ""
                  } ${!isContratoActivo ? "opacity-50 grayscale" : ""}`}
                >
                  {/* Fila 1: Razón social a ancho completo */}
                  <div className="flex items-start gap-2">
                    <BuildingOffice2Icon
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isContratoActivo ? "text-indigo-400" : "text-zinc-600"
                      }`}
                    />
                    <Text
                      size="xs"
                      fw={700}
                      className="text-zinc-100 leading-snug wrap-break-word flex-1 min-w-0"
                    >
                      {c.razon_social}
                    </Text>
                  </div>

                  {/* Fila 2: RUC + fechas a la izquierda, acciones arriba a la derecha */}
                  <div className="flex items-start justify-between gap-2 pl-6">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0 flex-1">
                      <Text
                        size="10px"
                        fw={700}
                        className="text-zinc-500 font-mono uppercase tracking-wider"
                      >
                        {c.ruc}
                      </Text>
                      <span className="text-zinc-700 text-[10px]">·</span>
                      <CalendarIcon className="w-3 h-3 text-zinc-500 shrink-0" />
                      <Text size="10px" className="text-zinc-400 font-mono">
                        {c.fecha_inicio}
                        <span className="mx-1">→</span>
                        {c.fecha_fin ?? "Presente"}
                      </Text>
                      {/* Acciones en la esquina superior derecha */}
                      <Group gap={4} wrap="nowrap" className="">
                        <Tooltip
                          label="Ver evidencias"
                          withArrow
                          position="top"
                        >
                          <ActionIcon
                            variant="subtle"
                            color="indigo"
                            size="md"
                            radius="md"
                            onClick={() => onOpenEvidencias(c.id_contrato)}
                            className="hover:bg-indigo-500/10"
                          >
                            <PaperClipIcon className="w-4 h-4" />
                          </ActionIcon>
                        </Tooltip>
                        {isContratoActivo && (
                          <Tooltip
                            label="Finalizar contrato"
                            withArrow
                            position="top"
                          >
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="md"
                              radius="md"
                              onClick={() => onTerminarContrato(c.id_contrato)}
                              loading={estaTerminando}
                              className="hover:bg-red-500/10"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-zinc-800/50 bg-zinc-950/20 cursor-pointer hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-colors group/add"
            onClick={() => onAddContrato(concesion)}
          >
            <PlusIcon className="w-3.5 h-3.5 text-zinc-600 group-hover/add:text-indigo-400 transition-colors" />
            <Text
              size="xs"
              className="text-zinc-600 group-hover/add:text-zinc-400 transition-colors"
            >
              Registrar primer contrato
            </Text>
          </div>
        )}
      </div>
    </div>
  );
};

// Re-export del skeleton para uso en la página
export const ConcesionCardSkeleton = () => (
  <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-4 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton height={14} width="60%" radius="md" />
      <Skeleton height={16} width={50} radius="sm" />
    </div>
    <Skeleton height={10} width="40%" radius="sm" />
    <Skeleton height={48} radius="md" />
    <Skeleton height={80} radius="md" />
  </div>
);
