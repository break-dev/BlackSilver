import {
  Stack,
  Group,
  Text,
  Badge,
  Button,
  Checkbox,
  Loader,
} from "@mantine/core";
import { MapPinIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import type { RES_Empleado, RES_Labor } from "../service/empleados.responses";

interface AsignacionLaboresProps {
  empleado: RES_Empleado;
  laboresDisponibles: RES_Labor[];
  seleccionados: number[];
  loading: boolean;
  loadingLabores: boolean;
  onToggle: (idLabor: number) => void;
  onAsignar: () => void;
  onCancelar: () => void;
}

export const AsignacionLabores = ({
  empleado,
  laboresDisponibles,
  seleccionados,
  loading,
  loadingLabores,
  onToggle,
  onAsignar,
  onCancelar,
}: AsignacionLaboresProps) => {
  return (
    <Stack gap="lg" className="px-1">
      {/* Info del empleado */}
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
        <Text
          size="xs"
          className="text-zinc-500 uppercase tracking-widest mb-1"
        >
          Empleado
        </Text>
        <Text size="sm" fw={700} className="text-white">
          {empleado.apellido}, {empleado.nombre}
        </Text>
        <Group gap="xs" mt={6}>
          <MapPinIcon className="w-3.5 h-3.5 text-emerald-400" />
          <Text size="xs" className="text-zinc-300">
            {empleado.mina}
          </Text>
        </Group>
      </div>

      {/* Lista de labores */}
      <Stack gap="sm">
        <Text
          size="xs"
          fw={700}
          className="text-zinc-400 uppercase tracking-widest"
        >
          Labores disponibles en la Mina
        </Text>

        {loadingLabores ? (
          <div className="flex items-center justify-center py-10">
            <Loader size="sm" color="indigo" />
          </div>
        ) : laboresDisponibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800">
            <WrenchScrewdriverIcon className="w-8 h-8 text-zinc-700 mb-2" />
            <Text size="sm" className="text-zinc-500 text-center">
              No hay labores activas en esta mina
            </Text>
            <Text size="xs" className="text-zinc-600 text-center mt-1">
              Debe registrar labores en la mina para poder asignarlas
            </Text>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {laboresDisponibles.map((labor) => {
              const isChecked = seleccionados.includes(labor.id_labor);
              return (
                <div
                  key={labor.id_labor}
                  onClick={() => onToggle(labor.id_labor)}
                  className={`
                    flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200
                    ${
                      isChecked
                        ? "border-indigo-500/50 bg-indigo-500/10 shadow-sm shadow-indigo-500/5"
                        : "border-zinc-800/60 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/50"
                    }
                  `}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={() => onToggle(labor.id_labor)}
                    color="indigo"
                    radius="sm"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <Badge
                        variant="light"
                        color="cyan"
                        radius="xs"
                        size="sm"
                        className="font-mono"
                      >
                        {labor.correlativo}
                      </Badge>
                      {labor.nombre && (
                        <Text
                          size="xs"
                          className="text-zinc-400 mt-1 font-medium"
                        >
                          {labor.nombre}
                        </Text>
                      )}
                    </div>
                    {isChecked && (
                      <Badge variant="dot" color="indigo" size="xs">
                        Asignada
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Stack>

      {/* Footer */}
      <Group justify="flex-end" gap="md" mt="xs">
        <Button
          variant="subtle"
          onClick={onCancelar}
          disabled={loading}
          radius="lg"
          size="sm"
          className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
        >
          Cancelar
        </Button>
        <Button
          loading={loading}
          onClick={onAsignar}
          disabled={loadingLabores}
          radius="lg"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20 px-8 transition-all hover:scale-[1.02]"
        >
          Guardar Cambios{" "}
          {seleccionados.length > 0 ? `(${seleccionados.length})` : ""}
        </Button>
      </Group>
    </Stack>
  );
};
